import { expect, test, type Page, type Route } from '@playwright/test';

const LANDING_URL = 'http://127.0.0.1:4321/#reservar';
const BOOK_ROUTE = '**/functions/v1/book';
const WHATSAPP_URL = 'https://wa.me/50664417187?text=Hola%2C%20quiero%20reservar%20en%20Humaya.';

async function openLanding(page: Page) {
  await page.addInitScript(() => localStorage.setItem('humaya-lang', 'es'));
  await page.goto(LANDING_URL, { waitUntil: 'domcontentloaded' });
}

async function fillBooking(page: Page, phone = '6441 7187') {
  const form = page.getByRole('form', { name: 'Formulario de reservas' });
  await form.getByLabel('Nombre').fill('Ana Prueba');
  await form.getByLabel('Email').fill('ana@example.com');
  await form.getByLabel('WhatsApp / teléfono').fill(phone);
}

async function successfulBook(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      ok: true,
      id: '11111111-1111-4111-8111-111111111111',
      notified: true,
      acked: true,
      crm_synced: true,
      reused: false,
    }),
  });
}

test('registra la reserva y ofrece WhatsApp solo después del éxito', async ({ page }) => {
  let payload: Record<string, unknown> | undefined;
  await page.route(BOOK_ROUTE, async (route) => {
    payload = route.request().postDataJSON() as Record<string, unknown>;
    await successfulBook(route);
  });

  await openLanding(page);
  await expect(page.getByRole('link', { name: 'Continuar por WhatsApp' })).toBeHidden();
  await expect(page.getByText('Se abrirá WhatsApp con un mensaje listo.')).toBeHidden();
  await fillBooking(page);
  await page.getByRole('button', { name: 'Enviar' }).click();

  const whatsapp = page.getByRole('link', { name: 'Continuar por WhatsApp' });
  await expect(page.getByText('Listo. Te escribimos pronto.')).toBeVisible();
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAttribute('href', WHATSAPP_URL);
  expect(payload?.phone).toBe('6441 7187');
  expect(payload?.request_id).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
});

test('rechaza teléfonos inválidos sin llamar al backend', async ({ page }) => {
  let requests = 0;
  await page.route(BOOK_ROUTE, async (route) => {
    requests += 1;
    await successfulBook(route);
  });

  await openLanding(page);
  await fillBooking(page, '12345');
  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(page.getByText(/Ese número no se ve válido/)).toBeVisible();
  await expect(
    page.getByRole('form', { name: 'Formulario de reservas' }).getByLabel('WhatsApp / teléfono'),
  ).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('link', { name: 'Continuar por WhatsApp' })).toBeHidden();
  expect(requests).toBe(0);
});

test('conserva los datos y no habilita WhatsApp cuando book falla', async ({ page }) => {
  await page.route(BOOK_ROUTE, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'crm_sync_failed' }),
    });
  });

  await openLanding(page);
  await fillBooking(page, '+1 (305) 555-0123');
  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(
    page.getByText('Algo falló de nuestro lado. Probá de nuevo en un momento.'),
  ).toBeVisible();
  const form = page.getByRole('form', { name: 'Formulario de reservas' });
  await expect(form.getByLabel('Nombre')).toHaveValue('Ana Prueba');
  await expect(form.getByLabel('Email')).toHaveValue('ana@example.com');
  await expect(form.getByLabel('WhatsApp / teléfono')).toHaveValue('+1 (305) 555-0123');
  await expect(page.getByRole('link', { name: 'Continuar por WhatsApp' })).toBeHidden();
});

test('impide un segundo submit mientras la primera solicitud está en curso', async ({ page }) => {
  let requests = 0;
  let releaseRequest: (() => void) | undefined;
  const requestGate = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });
  await page.route(BOOK_ROUTE, async (route) => {
    requests += 1;
    await requestGate;
    await successfulBook(route);
  });

  await openLanding(page);
  await fillBooking(page);
  const send = page.getByRole('button', { name: 'Enviar' });
  await send.click();
  await expect(page.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
  await page.getByRole('form', { name: 'Formulario de reservas' }).evaluate((form) => {
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
  });
  expect(requests).toBe(1);
  releaseRequest?.();
  await expect(page.getByRole('link', { name: 'Continuar por WhatsApp' })).toBeVisible();
  expect(requests).toBe(1);
});

test('traduce el campo y la continuación en una vista móvil', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.route(BOOK_ROUTE, successfulBook);
  await openLanding(page);

  await page.getByRole('button', { name: 'ES', exact: true }).click();
  await page.getByRole('menuitem', { name: 'English' }).click();
  const form = page.getByRole('form', { name: 'Booking form' });
  await expect(form.getByLabel('WhatsApp / phone')).toBeVisible();
  await form.getByLabel('Name').fill('Ana Prueba');
  await form.getByLabel('Email').fill('ana@example.com');
  await form.getByLabel('WhatsApp / phone').fill('+44 20 7946 0958');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByRole('link', { name: 'Continue on WhatsApp' })).toBeVisible();

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Deutsch' }).click();
  await expect(page.getByRole('link', { name: 'Auf WhatsApp fortfahren' })).toBeVisible();
  await page.getByRole('button', { name: 'DE', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Français' }).click();
  await expect(page.getByRole('link', { name: 'Continuer sur WhatsApp' })).toBeVisible();
});

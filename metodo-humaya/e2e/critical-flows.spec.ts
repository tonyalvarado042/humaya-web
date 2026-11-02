import { expect, test, type Locator } from '@playwright/test';

async function firstEnabled(buttons: Locator): Promise<Locator> {
  const total = await buttons.count();
  for (let index = 0; index < total; index += 1) {
    const candidate = buttons.nth(index);
    if (await candidate.isEnabled()) return candidate;
  }
  throw new Error('No se encontró un horario disponible.');
}

test('Hannah completa la entrevista light con consentimiento', async ({ page }) => {
  await page.goto('/app');
  await page.getByLabel('Huésped de la demo').selectOption('s-weber');
  await page.getByRole('link', { name: 'Interview' }).click();

  await expect(page.getByRole('heading', { name: 'Your interview' })).toBeVisible();
  await expect(page.getByText(/artificial intelligence assistant/)).toBeVisible();
  await page.getByRole('button', { name: 'Accept and continue' }).click();
  await page.getByRole('button', { name: 'None', exact: true }).click();
  await page.getByRole('button', { name: 'Nothing in particular' }).click();
  await page.getByRole('button', { name: 'Calmly, with space' }).click();

  await expect(page.getByText(/everything we need to prepare your arrival/)).toBeVisible();
  await page.getByRole('link', { name: 'Back to Home' }).click();
  await expect(page.getByText(/It's complete/)).toBeVisible();
});

test('Valeria reserva el primer horario disponible de sauna', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('link', { name: 'Reservas' }).click();

  const slots = page.getByRole('group', { name: 'Horarios de sauna' });
  await expect(slots).toBeVisible();
  const slot = await firstEnabled(slots.getByRole('button'));
  const time = await slot.getAttribute('aria-label');
  if (!time) throw new Error('El horario no tiene nombre accesible.');

  await slot.click();
  await page.getByRole('button', { name: `Reservar Sauna · ${time}` }).click();

  await expect(page.getByText('Reservado')).toBeVisible();
  await expect(page.getByText(new RegExp(`Sauna .* ${time}`))).toBeVisible();
  await expect(slots.getByRole('button', { name: `${time}, ocupado` })).toBeDisabled();
});

test('recepción abre el perfil de Valeria desde Llegadas', async ({ page }) => {
  await page.goto('/staff');

  const arrivals = page.getByRole('table', { name: 'Llegadas del período' });
  const valeria = arrivals.getByRole('row', { name: /Valeria Méndez y Andrés Rojas/ });
  await valeria.getByRole('link', { name: 'Ver perfil' }).click();

  await expect(page).toHaveURL(/\/staff\/guests\/s-mendez-rojas$/);
  await expect(page.getByRole('heading', { name: 'Valeria Méndez y Andrés Rojas' })).toBeVisible();
  await expect(page.getByText(/Villa 04/)).toBeVisible();
  await expect(page.getByText('Andrés: alergia a frutos secos', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Experiencias WOW' })).toBeVisible();
  await expect(page.getByText('Sauna privada al atardecer con vista al volcán')).toBeVisible();
});

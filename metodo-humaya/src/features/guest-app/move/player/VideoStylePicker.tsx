import { useTranslation } from 'react-i18next';
import { SegmentedControl, type SegmentedOption } from '@/components/ui';
import type { VideoStyle } from './types';

interface VideoStylePickerProps {
  value: VideoStyle;
  onChange: (value: VideoStyle) => void;
}

/** Selector de los cuatro tratamientos de video, para comparar en vivo. */
export function VideoStylePicker({ value, onChange }: VideoStylePickerProps) {
  const { t } = useTranslation();
  const options: SegmentedOption<VideoStyle>[] = [
    { value: 'immersive', label: t('move.player.videoStyleImmersive') },
    { value: 'framed', label: t('move.player.videoStyleFramed') },
    { value: 'bubble', label: t('move.player.videoStyleBubble') },
    { value: 'takeover', label: t('move.player.videoStyleTakeover') },
  ];

  return (
    <div className="overflow-x-auto">
      <SegmentedControl
        label={t('move.player.videoStyleLabel')}
        options={options}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

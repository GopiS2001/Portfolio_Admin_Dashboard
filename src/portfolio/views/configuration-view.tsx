import type { Section, Settings } from '../types';
import type { FieldDef } from '../components/form-fields';

import { mutate } from 'swr';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import axios from 'src/lib/axios';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { PageShell } from '../components/page-shell';
import { api, useResource, saveSingleton } from '../api';
import { saveSection } from '../components/section-heading-card';
import { SANS_FONTS, SERIF_FONTS, SECTION_LABELS } from '../options';
import { FormFields, toFormValues, fromFormValues } from '../components/form-fields';

// ----------------------------------------------------------------------

/** Every editable setting on this page except the custom controls below. */
const SITE_FIELDS: FieldDef[] = [
  {
    name: 'siteEnabled',
    label: 'Website online',
    type: 'switch',
    helperText: 'Off shows a maintenance page instead of the site.',
  },
  { name: 'maintenanceMessage', label: 'Maintenance message' },
  { name: 'siteTitle', label: 'Browser tab title', half: true },
  { name: 'metaDescription', label: 'Search description (SEO)', half: true },
];

const HEADER_FIELDS: FieldDef[] = [
  { name: 'showHeader', label: 'Show top header / navigation bar', type: 'switch' },
  { name: 'showHeaderCta', label: 'Show the header button', type: 'switch', half: true },
  { name: 'headerCtaLabel', label: 'Header button label', half: true },
];

const THEME_FIELDS: FieldDef[] = [
  {
    name: 'enableThemeToggle',
    label: 'Dark / light mode toggle',
    type: 'switch',
    helperText: 'Off hides the sun/moon button and always uses the default theme below.',
  },
  { name: 'accentLight', label: 'Accent colour (light mode)', type: 'color', half: true },
  { name: 'accentDark', label: 'Accent colour (dark mode)', type: 'color', half: true },
];

const BLOCK_FIELDS: FieldDef[] = [
  { name: 'showStats', label: 'Stats row under the hero', type: 'switch', half: true },
  { name: 'showResumeButton', label: 'Résumé button', type: 'switch', half: true },
  { name: 'showMarquee', label: 'Scrolling technology strip', type: 'switch', half: true },
  { name: 'showContactForm', label: 'Contact form', type: 'switch', half: true },
  { name: 'showWhatsappButton', label: 'Floating WhatsApp button', type: 'switch', half: true },
  { name: 'showFooter', label: 'Footer', type: 'switch', half: true },
  { name: 'enableAnimations', label: 'Animations', type: 'switch', half: true },
];

const SIMPLE_FIELDS = [...SITE_FIELDS, ...HEADER_FIELDS, ...THEME_FIELDS, ...BLOCK_FIELDS];
const CUSTOM_KEYS = [
  'defaultTheme',
  'fontSans',
  'fontSerif',
  'baseFontSize',
  'headingScale',
] as const;

const googleFontUrl = (family: string, italic = false) =>
  `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}${italic ? ':ital@0;1' : ''}&display=swap`;

// ----------------------------------------------------------------------

export function ConfigurationView() {
  const { data: settings } = useResource<Settings>(api.settings);

  const defaults = (s?: Settings): Record<string, any> => ({
    ...toFormValues(SIMPLE_FIELDS, s),
    defaultTheme: s?.defaultTheme ?? 'system',
    fontSans: s?.fontSans ?? 'Geist',
    fontSerif: s?.fontSerif ?? 'Instrument Serif',
    baseFontSize: s?.baseFontSize ?? 16,
    headingScale: s?.headingScale ?? 100,
  });

  const methods = useForm({ defaultValues: defaults(settings) });
  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = methods;

  useEffect(() => {
    if (settings) reset(defaults(settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const values = watch();

  // Load the chosen fonts so the preview shows them
  useEffect(() => {
    const families = [
      values.fontSans !== 'Geist' && googleFontUrl(values.fontSans),
      values.fontSerif !== 'Instrument Serif' && googleFontUrl(values.fontSerif, true),
    ].filter(Boolean) as string[];
    const links = families.map((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach((l) => l.remove());
  }, [values.fontSans, values.fontSerif]);

  const onSubmit = handleSubmit(async (formValues) => {
    const body = {
      ...fromFormValues(SIMPLE_FIELDS, formValues),
      ...Object.fromEntries(CUSTOM_KEYS.map((k) => [k, formValues[k]])),
    } as Partial<Settings>;
    try {
      const saved = await saveSingleton<Settings>(api.settings, body);
      reset(defaults(saved));
      toast.success('Configuration saved — the website is updated');
    } catch (error) {
      toast.error((error as Error).message);
    }
  });

  const saveBar = (
    <Stack direction="row" spacing={1.5}>
      <Button color="inherit" variant="outlined" disabled={!isDirty} onClick={() => reset()}>
        Discard
      </Button>
      <Button
        variant="contained"
        disabled={!isDirty}
        loading={isSubmitting}
        onClick={onSubmit}
        startIcon={<Iconify icon="solar:check-circle-bold" />}
      >
        Save configuration
      </Button>
    </Stack>
  );

  return (
    <PageShell heading="Configuration" action={saveBar}>
      {!values.siteEnabled && (
        <Alert severity="warning">
          The website is switched off — visitors see the maintenance message.
        </Alert>
      )}

      <SectionsCard />

      <Form methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              <SettingsCard title="Website" icon="solar:monitor-bold">
                <FormFields fields={SITE_FIELDS} />
              </SettingsCard>

              <SettingsCard title="Top header" icon="ic:round-view-quilt">
                <FormFields fields={HEADER_FIELDS} />
              </SettingsCard>

              <SettingsCard title="Blocks" icon="ic:round-view-module">
                <FormFields fields={BLOCK_FIELDS} />
              </SettingsCard>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              <SettingsCard title="Dark & light mode" icon="solar:cloudy-moon-bold-duotone">
                <Stack spacing={3}>
                  <FormFields fields={THEME_FIELDS.slice(0, 1)} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Default theme
                    </Typography>
                    <Controller
                      name="defaultTheme"
                      control={control}
                      render={({ field }) => (
                        <ToggleButtonGroup
                          exclusive
                          fullWidth
                          value={field.value}
                          onChange={(_, v) => v && field.onChange(v)}
                        >
                          <ToggleButton value="light">Light</ToggleButton>
                          <ToggleButton value="dark">Dark</ToggleButton>
                          <ToggleButton value="system">Follow device</ToggleButton>
                        </ToggleButtonGroup>
                      )}
                    />
                  </Box>
                  <FormFields fields={THEME_FIELDS.slice(1)} />
                </Stack>
              </SettingsCard>

              <SettingsCard title="Typography" icon="ic:round-format-italic">
                <Stack spacing={3}>
                  <Controller
                    name="fontSans"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select fullWidth label="Body font">
                        {SANS_FONTS.map((f) => (
                          <MenuItem key={f} value={f} sx={{ fontFamily: `"${f}", sans-serif` }}>
                            {f}
                            {f === 'Geist' ? ' (default)' : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <Controller
                    name="fontSerif"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select fullWidth label="Heading font">
                        {SERIF_FONTS.map((f) => (
                          <MenuItem key={f} value={f} sx={{ fontFamily: `"${f}", serif` }}>
                            {f}
                            {f === 'Instrument Serif' ? ' (default)' : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <SliderField
                    name="baseFontSize"
                    label="Base font size"
                    min={12}
                    max={22}
                    unit="px"
                    control={control}
                  />
                  <SliderField
                    name="headingScale"
                    label="Heading size"
                    min={70}
                    max={140}
                    step={5}
                    unit="%"
                    control={control}
                  />

                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'background.neutral',
                      fontFamily: `"${values.fontSans}", sans-serif`,
                      fontSize: values.baseFontSize,
                    }}
                  >
                    <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                      Preview
                    </Typography>
                    <Box
                      sx={{
                        fontFamily: `"${values.fontSerif}", serif`,
                        fontSize: `${(2.25 * values.headingScale) / 100}em`,
                        lineHeight: 1.1,
                        my: 1,
                      }}
                    >
                      Crafting{' '}
                      <Box component="em" sx={{ color: values.accentLight }}>
                        digital experiences
                      </Box>
                    </Box>
                    <Box sx={{ color: 'text.secondary' }}>
                      I design and build fast, accessible, beautifully crafted web products.
                    </Box>
                  </Box>
                </Stack>
              </SettingsCard>
            </Stack>
          </Grid>
        </Grid>

        <Stack direction="row" sx={{ mt: 3, justifyContent: 'flex-end' }}>
          {saveBar}
        </Stack>
      </Form>

      <SnapshotCard updatedAt={settings?.updatedAt} />
    </PageShell>
  );
}

// ----------------------------------------------------------------------

function SettingsCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Iconify>['icon'];
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        avatar={<Iconify icon={icon} width={24} sx={{ color: 'primary.main' }} />}
        sx={{ mb: 2 }}
      />
      <Divider />
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SliderField({
  name,
  label,
  min,
  max,
  step = 1,
  unit,
  control,
}: {
  name: 'baseFontSize' | 'headingScale';
  label: string;
  min: number;
  max: number;
  step?: number;
  unit: string;
  control: any;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2">{label}</Typography>
            <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
              {field.value}
              {unit}
            </Typography>
          </Box>
          <Slider
            value={Number(field.value)}
            min={min}
            max={max}
            step={step}
            marks
            onChange={(_, v) => field.onChange(v as number)}
            valueLabelDisplay="auto"
          />
        </Box>
      )}
    />
  );
}

// ----------------------------------------------------------------------

/** One row per website section: on/off, in-nav, order. Saves immediately. */
function SectionsCard() {
  const { data } = useResource<Section[]>(api.sections);
  const sections = data ?? [];

  const toggle = async (section: Section, field: 'visible' | 'showInNav') => {
    try {
      await saveSection(section.key, { [field]: !section[field] });
      toast.success(
        `${SECTION_LABELS[section.key]} ${field === 'visible' ? (section[field] ? 'hidden' : 'shown') : section[field] ? 'removed from' : 'added to'}${field === 'showInNav' ? ' navigation' : ''}`
      );
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const move = async (index: number, delta: number) => {
    const keys = sections.map((s) => s.key);
    const target = index + delta;
    if (target < 0 || target >= keys.length) return;
    [keys[index], keys[target]] = [keys[target], keys[index]];
    try {
      const res = await axios.patch(`${api.sections}/reorder`, { keys });
      await mutate(api.sections, res.data, { revalidate: false });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Website sections"
        subheader="Switch pages on/off, choose what appears in the top menu and set the order. Changes apply instantly."
        avatar={<Iconify icon="ic:round-view-list" width={24} sx={{ color: 'primary.main' }} />}
        sx={{ mb: 2 }}
      />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: 520 }}>
          <Box
            sx={{
              px: 3,
              py: 1.5,
              display: 'grid',
              gridTemplateColumns: '72px 1fr 120px 120px',
              typography: 'overline',
              color: 'text.disabled',
            }}
          >
            <span>Order</span>
            <span>Section</span>
            <span>On website</span>
            <span>In menu</span>
          </Box>
          {sections.map((s, i) => (
            <Box
              key={s.key}
              sx={{
                px: 3,
                py: 1,
                display: 'grid',
                alignItems: 'center',
                gridTemplateColumns: '72px 1fr 120px 120px',
                borderTop: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              }}
            >
              <Box>
                <IconButton size="small" disabled={i === 0} onClick={() => move(i, -1)}>
                  <Iconify icon="eva:arrow-ios-upward-fill" width={16} />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={i === sections.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <Iconify icon="eva:arrow-ios-downward-fill" width={16} />
                </IconButton>
              </Box>
              <Box>
                <Typography variant="subtitle2">{SECTION_LABELS[s.key]}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Menu label: {s.navLabel || '—'}
                </Typography>
              </Box>
              <Switch checked={s.visible} onChange={() => toggle(s, 'visible')} />
              <Switch
                checked={s.showInNav}
                disabled={!s.visible}
                onChange={() => toggle(s, 'showInNav')}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

function SnapshotCard({ updatedAt }: { updatedAt?: string }) {
  const rebuild = async () => {
    try {
      await axios.post(api.snapshot);
      toast.success('Offline snapshot rebuilt');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Offline copy"
        subheader="Every save also writes a static snapshot of the whole site. If the backend or MySQL stops, the website keeps showing exactly this data."
        avatar={
          <Iconify icon="eva:cloud-download-fill" width={24} sx={{ color: 'primary.main' }} />
        }
        action={
          <Button
            variant="soft"
            onClick={rebuild}
            startIcon={<Iconify icon="solar:restart-bold" />}
          >
            Rebuild now
          </Button>
        }
        sx={{ pb: 3 }}
      />
      {updatedAt && (
        <Typography
          variant="caption"
          sx={{ px: 3, pb: 3, display: 'block', color: 'text.disabled' }}
        >
          Settings last changed {new Date(updatedAt).toLocaleString()}
        </Typography>
      )}
    </Card>
  );
}

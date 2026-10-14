import type { FieldDef } from '../components/form-fields';
import type {
  Stat,
  Profile,
  Project,
  Highlight,
  SkillGroup,
  Experience,
  MarqueeItem,
  AboutParagraph,
} from '../types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

import { Label } from 'src/components/label';

import { api } from '../api';
import { driveImage } from '../drive';
import { CrudList } from '../components/crud-list';
import { PageShell } from '../components/page-shell';
import { SingletonForm } from '../components/singleton-form';
import { GRADIENTS, SKILL_ICONS, PROJECT_CATEGORIES } from '../options';
import { SectionHeadingCard } from '../components/section-heading-card';

// ----------------------------------------------------------------------

function ChipList({ items, max = 6 }: { items: string[]; max?: number }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {items.slice(0, max).map((t) => (
        <Chip key={t} label={t} size="small" variant="soft" />
      ))}
      {items.length > max && <Chip label={`+${items.length - max}`} size="small" />}
    </Box>
  );
}

const clamp2 = {
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
} as const;

// ---------------------------------------------------------------------- Home

const HERO_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Your name', required: true, half: true },
  { name: 'role', label: 'Role / title', half: true, placeholder: 'Full-Stack Developer' },
  { name: 'location', label: 'Location (place)', half: true, placeholder: 'Chennai, India' },
  { name: 'availabilityText', label: 'Availability badge text', half: true },
  { name: 'available', label: 'Show “available for work” badge', type: 'switch' },
  {
    name: 'heroTitle',
    label: 'Headline',
    half: true,
    helperText: '{name} is replaced with your name',
  },
  { name: 'heroHighlight', label: 'Headline highlight (animated)', half: true },
  { name: 'heroTitleSuffix', label: 'Headline ending', half: true },
  { name: 'primaryCtaLabel', label: '“View my work” button label', half: true },
  { name: 'tagline', label: 'Intro paragraph', type: 'textarea', rows: 3 },
  { name: 'resumeCtaLabel', label: 'Résumé button label', half: true },
  { name: 'resumeUrl', label: 'Résumé (PDF)', type: 'file', half: true },
  {
    name: 'avatarUrl',
    label: 'Profile photo',
    type: 'image',
    helperText: 'Shown in the About section. Leave empty to show your initials.',
  },
];

const STAT_FIELDS: FieldDef[] = [
  { name: 'value', label: 'Value', required: true, half: true, placeholder: '5+' },
  { name: 'label', label: 'Label', required: true, half: true, placeholder: 'Years experience' },
];

export function HomeContentView() {
  return (
    <PageShell heading="Home" anchor="home">
      <SectionHeadingCard sectionKey="home" />
      <SingletonForm<Profile>
        url={api.profile}
        title="Hero"
        subheader="The first screen visitors see."
        fields={HERO_FIELDS}
      />
      <CrudList<Stat>
        url={api.stats}
        title="Stats"
        subheader="Numbers under the hero (turn the whole row off in Configuration)."
        itemName="stat"
        fields={STAT_FIELDS}
        renderPrimary={(s) => s.value}
        renderSecondary={(s) => s.label}
      />
    </PageShell>
  );
}

// ---------------------------------------------------------------------- About

const PARAGRAPH_FIELDS: FieldDef[] = [
  {
    name: 'content',
    label: 'Paragraph',
    type: 'textarea',
    rows: 5,
    required: true,
    helperText: 'The first visible paragraph is shown in a stronger colour.',
  },
];

const HIGHLIGHT_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'text', label: 'Description' },
];

export function AboutContentView() {
  return (
    <PageShell heading="About" anchor="about">
      <SectionHeadingCard sectionKey="about" />
      <CrudList<AboutParagraph>
        url={api.aboutParagraphs}
        title="About paragraphs"
        itemName="paragraph"
        fields={PARAGRAPH_FIELDS}
        dialogMaxWidth="md"
        renderPrimary={(p) => <Box sx={{ ...clamp2, whiteSpace: 'normal' }}>{p.content}</Box>}
      />
      <CrudList<Highlight>
        url={api.highlights}
        title="Highlights"
        subheader="Small cards under the paragraphs."
        itemName="highlight"
        fields={HIGHLIGHT_FIELDS}
        renderPrimary={(h) => h.title}
        renderSecondary={(h) => h.text}
      />
    </PageShell>
  );
}

// ---------------------------------------------------------------------- Skills

const SKILL_GROUP_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Group title', required: true, half: true, placeholder: 'Frontend' },
  { name: 'icon', label: 'Icon', type: 'select', options: SKILL_ICONS, half: true },
  { name: 'skills', label: 'Skills', type: 'tags' },
];

const MARQUEE_FIELDS: FieldDef[] = [{ name: 'label', label: 'Technology', required: true }];

export function SkillsContentView() {
  return (
    <PageShell heading="Skills" anchor="skills">
      <SectionHeadingCard sectionKey="skills" />
      <CrudList<SkillGroup>
        url={api.skillGroups}
        title="Skill groups"
        itemName="skill group"
        fields={SKILL_GROUP_FIELDS}
        renderPrimary={(g) => g.title}
        renderSecondary={(g) => <ChipList items={g.skills} max={8} />}
      />
      <CrudList<MarqueeItem>
        url={api.marquee}
        title="Scrolling technology strip"
        subheader="The infinite marquee under the skill cards (turn it off in Configuration)."
        itemName="technology"
        fields={MARQUEE_FIELDS}
        renderPrimary={(m) => m.label}
      />
    </PageShell>
  );
}

// ---------------------------------------------------------------------- Experience

const EXPERIENCE_FIELDS: FieldDef[] = [
  { name: 'role', label: 'Role', required: true, half: true },
  { name: 'company', label: 'Company', required: true, half: true },
  { name: 'period', label: 'Period', half: true, placeholder: '2023 — Present' },
  { name: 'location', label: 'Location', half: true, placeholder: 'Remote' },
  {
    name: 'description',
    label: 'Project explanation',
    type: 'textarea',
    rows: 6,
    placeholder: 'Built the payment gateway with Socket.IO…\nIntegrated the bank UPI API…',
    helperText: 'One point per line — each line becomes a bullet point on the website.',
  },
  { name: 'stack', label: 'Tech stack', type: 'tags' },
];

export function ExperienceContentView() {
  return (
    <PageShell heading="Experience" anchor="experience">
      <SectionHeadingCard sectionKey="experience" />
      <CrudList<Experience>
        url={api.experiences}
        title="Work history"
        subheader="Newest first — use the arrows to reorder."
        itemName="experience"
        fields={EXPERIENCE_FIELDS}
        dialogMaxWidth="md"
        renderPrimary={(e) => `${e.role} · ${e.company}`}
        renderSecondary={(e) => (
          <>
            {[e.period, e.location].filter(Boolean).join(' · ')}
            {e.description && <Box sx={{ ...clamp2, mt: 0.5 }}>{e.description}</Box>}
            {e.stack.length > 0 && (
              <Box sx={{ mt: 0.75 }}>
                <ChipList items={e.stack} />
              </Box>
            )}
          </>
        )}
      />
    </PageShell>
  );
}

// ---------------------------------------------------------------------- Projects

const PROJECT_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', required: true, half: true },
  { name: 'featured', label: 'Featured (full-width card)', type: 'switch', half: true },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: PROJECT_CATEGORIES,
    half: true,
    helperText: 'Visitors can filter projects by this on the website',
  },
  { name: 'description', label: 'Description', type: 'textarea', rows: 3, required: true },
  { name: 'tags', label: 'Tags', type: 'tags' },
  {
    name: 'liveUrl',
    label: 'Live site URL',
    half: true,
    helperText: 'Leave empty to hide the button',
  },
  {
    name: 'sourceUrl',
    label: 'Source code URL',
    half: true,
    helperText: 'Leave empty to hide the button',
  },
  {
    name: 'links',
    label: 'More live links',
    type: 'links',
    helperText:
      'For projects with several parts, e.g. "Admin dashboard" or "Web app". Each becomes its own button.',
  },
  {
    name: 'imageUrl',
    label: 'Cover image',
    type: 'image',
    helperText: 'Optional screenshot. Without one, the gradient cover below is used.',
  },
  {
    name: 'apkUrl',
    label: 'Android app (APK)',
    type: 'file',
    accept: '.apk,application/vnd.android.package-archive',
    helperText: 'Upload the release .apk (up to 200 MB) to show a "Download APK" button. Leave empty to hide it.',
  },
  { name: 'gradient', label: 'Gradient cover', type: 'select', options: GRADIENTS },
];

export function ProjectsContentView() {
  return (
    <PageShell heading="Projects" anchor="projects">
      <SectionHeadingCard sectionKey="projects" />
      <CrudList<Project>
        url={api.projects}
        title="Projects"
        itemName="project"
        fields={PROJECT_FIELDS}
        dialogMaxWidth="md"
        renderLeading={(p) => {
          const gradient = GRADIENTS.find((g) => g.value === p.gradient) ?? GRADIENTS[0];
          return (
            <Avatar
              variant="rounded"
              src={driveImage(p.imageUrl)}
              sx={{ width: 64, height: 44, background: `linear-gradient(135deg, ${gradient.css})` }}
            >
              {' '}
            </Avatar>
          );
        }}
        renderPrimary={(p) => (
          <>
            {p.title}
            <Label color={p.category === 'office' ? 'info' : 'default'} sx={{ ml: 1 }}>
              {PROJECT_CATEGORIES.find((c) => c.value === p.category)?.label ?? 'My project'}
            </Label>
            {p.featured && (
              <Label color="warning" sx={{ ml: 1 }}>
                Featured
              </Label>
            )}
            {p.apkUrl && (
              <Label color="success" sx={{ ml: 1 }}>
                APK
              </Label>
            )}
          </>
        )}
        renderSecondary={(p) => (
          <>
            <Box sx={clamp2}>{p.description}</Box>
            {p.tags.length > 0 && (
              <Box sx={{ mt: 0.75 }}>
                <ChipList items={p.tags} />
              </Box>
            )}
          </>
        )}
      />
    </PageShell>
  );
}

// ---------------------------------------------------------------------- Contact

const CONTACT_FIELDS: FieldDef[] = [
  { name: 'email', label: 'Email', half: true },
  { name: 'phone', label: 'Mobile number', half: true, placeholder: '+91 98765 43210' },
  {
    name: 'whatsapp',
    label: 'WhatsApp number',
    half: true,
    placeholder: '+91 98765 43210',
    helperText: 'With country code. Enables the WhatsApp button.',
  },
  { name: 'location', label: 'Place / location', half: true },
  { name: 'contactIntro', label: 'Contact intro text', type: 'textarea', rows: 3 },
];

const SOCIAL_FIELDS: FieldDef[] = [
  { name: 'linkedin', label: 'LinkedIn URL', half: true },
  { name: 'github', label: 'GitHub URL', half: true },
  { name: 'instagram', label: 'Instagram URL', half: true },
  { name: 'twitter', label: 'X / Twitter URL', half: true },
  { name: 'footerText', label: 'Footer text', helperText: 'Shown after “© year name.”' },
];

export function ContactContentView() {
  return (
    <PageShell heading="Contact" anchor="contact">
      <SectionHeadingCard sectionKey="contact" />
      <SingletonForm<Profile>
        url={api.profile}
        title="Contact details"
        subheader="Empty fields are hidden on the website."
        fields={CONTACT_FIELDS}
      />
      <SingletonForm<Profile>
        url={api.profile}
        title="Social links & footer"
        subheader="Icons appear in the footer for every link you fill in."
        fields={SOCIAL_FIELDS}
      />
    </PageShell>
  );
}

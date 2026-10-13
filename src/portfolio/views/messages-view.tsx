import type { Message } from '../types';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { PageShell } from '../components/page-shell';
import { api, deleteItem, updateItem, useResource } from '../api';

// ----------------------------------------------------------------------

/** Inbox for the website's contact form. */
export function MessagesView() {
  const { data, isLoading } = useResource<Message[]>(api.messages);
  const [deleting, setDeleting] = useState<Message | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const messages = data ?? [];
  const unread = messages.filter((m) => !m.read).length;

  const setRead = async (m: Message, read: boolean) => {
    try {
      await updateItem<Message>(api.messages, m.id, { read });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const open = (m: Message) => {
    setExpanded(expanded === m.id ? null : m.id);
    if (!m.read) setRead(m, true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteItem(api.messages, deleting.id);
      toast.success('Message deleted');
    } catch (error) {
      toast.error((error as Error).message);
    }
    setDeleting(null);
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <Stack spacing={1.5} sx={{ p: 3 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={64} />
          ))}
        </Stack>
      );
    }
    if (!messages.length) {
      return (
        <EmptyContent
          filled
          title="No messages yet"
          description="Messages sent from the website's contact form appear here."
          sx={{ m: 3, py: 8 }}
        />
      );
    }
    return (
      <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {messages.map((m) => (
          <Box key={m.id} sx={{ px: 3, py: 2, bgcolor: m.read ? 'transparent' : 'action.hover' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                onClick={() => open(m)}
                sx={{ flex: '1 1 auto', minWidth: 0, cursor: 'pointer' }}
              >
                <Typography variant="subtitle2" noWrap>
                  {!m.read && (
                    <Label color="info" sx={{ mr: 1 }}>
                      New
                    </Label>
                  )}
                  {m.name}{' '}
                  <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                    &lt;{m.email}&gt;
                  </Box>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mt: 0.5 }}
                  noWrap={expanded !== m.id}
                  whiteSpace={expanded === m.id ? 'pre-wrap' : undefined}
                >
                  {m.message}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0 }}>
                {fDateTime(m.createdAt)}
              </Typography>
              <Tooltip title="Reply by email">
                <IconButton
                  href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message')}`}
                >
                  <Iconify icon="solar:reply-bold" />
                </IconButton>
              </Tooltip>
              <Tooltip title={m.read ? 'Mark as unread' : 'Mark as read'}>
                <IconButton onClick={() => setRead(m, !m.read)}>
                  <Iconify icon={m.read ? 'solar:letter-unread-bold' : 'solar:letter-bold'} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton color="error" onClick={() => setDeleting(m)}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Stack>
    );
  };

  return (
    <PageShell heading="Messages" anchor="contact">
      <Card>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Inbox</Typography>
          {unread > 0 && <Label color="info">{unread} unread</Label>}
        </Box>
        <Divider />
        {renderBody()}
      </Card>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete message?"
        content={deleting ? `From ${deleting.name} <${deleting.email}>` : ''}
        action={
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        }
      />
    </PageShell>
  );
}

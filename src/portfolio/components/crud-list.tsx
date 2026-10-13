import type { Ordered } from '../types';
import type { FieldDef } from './form-fields';

import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { FormFields, buildSchema, toFormValues, fromFormValues } from './form-fields';
import { createItem, deleteItem, updateItem, useResource, reorderItems } from '../api';

// ----------------------------------------------------------------------

type CrudListProps<T extends Ordered> = {
  /** API collection URL, e.g. /api/projects */
  url: string;
  title: string;
  subheader?: string;
  /** Singular noun for buttons and dialogs ("project"). */
  itemName: string;
  fields: FieldDef[];
  renderPrimary: (item: T) => React.ReactNode;
  renderSecondary?: (item: T) => React.ReactNode;
  renderLeading?: (item: T) => React.ReactNode;
  dialogMaxWidth?: 'sm' | 'md';
};

/**
 * Full CRUD for one list resource: add / edit (dialog form), delete (confirm),
 * show-hide switch and up/down ordering. Every change is live on the website.
 */
export function CrudList<T extends Ordered>({
  url,
  title,
  subheader,
  itemName,
  fields,
  renderPrimary,
  renderSecondary,
  renderLeading,
  dialogMaxWidth = 'sm',
}: CrudListProps<T>) {
  const { data, isLoading } = useResource<T[]>(url);
  const items = data ?? [];

  const [editing, setEditing] = useState<T | null | 'new'>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);

  const toggleVisible = async (item: T) => {
    try {
      await updateItem<T>(url, item.id, { visible: !item.visible } as Partial<T>);
      toast.success(item.visible ? `Hidden from the website` : `Shown on the website`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const move = async (index: number, delta: number) => {
    const ids = items.map((i) => i.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorderItems(url, ids);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteItem(url, deleting.id);
      toast.success(`Deleted ${itemName}`);
      setDeleting(null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const renderList = () => {
    if (isLoading) {
      return (
        <Stack spacing={1.5} sx={{ p: 3 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      );
    }

    if (!items.length) {
      return (
        <EmptyContent
          filled
          title={`No ${itemName}s yet`}
          description={`Click "Add ${itemName}" to create the first one.`}
          sx={{ m: 3, py: 6 }}
        />
      );
    }

    return (
      <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {items.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              px: 3,
              py: 2,
              gap: 2,
              display: 'flex',
              alignItems: 'center',
              opacity: item.visible ? 1 : 0.55,
              transition: 'opacity 0.2s',
            }}
          >
            <Stack sx={{ flexShrink: 0 }}>
              <IconButton
                size="small"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <Iconify icon="eva:arrow-ios-upward-fill" width={16} />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Move down"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                <Iconify icon="eva:arrow-ios-downward-fill" width={16} />
              </IconButton>
            </Stack>

            {renderLeading?.(item)}

            <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
              <Typography variant="subtitle2" noWrap>
                {renderPrimary(item)}
              </Typography>
              {renderSecondary && (
                <Box sx={{ mt: 0.5, typography: 'body2', color: 'text.secondary' }}>
                  {renderSecondary(item)}
                </Box>
              )}
            </Box>

            <Tooltip title={item.visible ? 'Visible on website' : 'Hidden on website'}>
              <Switch
                size="small"
                checked={item.visible}
                onChange={() => toggleVisible(item)}
                slotProps={{ input: { 'aria-label': 'Visible on website' } }}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton onClick={() => setEditing(item)}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => setDeleting(item)}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>
    );
  };

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setEditing('new')}
          >
            Add {itemName}
          </Button>
        }
        sx={{ mb: 2 }}
      />
      <Divider />
      {renderList()}

      <ItemDialog
        open={editing !== null}
        item={editing === 'new' ? null : editing}
        url={url}
        itemName={itemName}
        fields={fields}
        maxWidth={dialogMaxWidth}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete ${itemName}?`}
        content="This removes it from the website and cannot be undone."
        action={
          <Button variant="contained" color="error" loading={busy} onClick={confirmDelete}>
            Delete
          </Button>
        }
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

type ItemDialogProps<T> = {
  open: boolean;
  item: T | null;
  url: string;
  itemName: string;
  fields: FieldDef[];
  maxWidth: 'sm' | 'md';
  onClose: () => void;
};

function ItemDialog<T extends Ordered>({
  open,
  item,
  url,
  itemName,
  fields,
  maxWidth,
  onClose,
}: ItemDialogProps<T>) {
  const allFields = useMemo<FieldDef[]>(
    () => [...fields, { name: 'visible', label: 'Show on website', type: 'switch' }],
    [fields]
  );

  const methods = useForm({
    resolver: zodResolver(buildSchema(allFields)),
    defaultValues: toFormValues(allFields, item),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) reset(toFormValues(allFields, item));
  }, [open, item, allFields, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const body = fromFormValues(allFields, values) as Partial<T>;
    try {
      if (item) {
        await updateItem<T>(url, item.id, body);
        toast.success(`Saved ${itemName}`);
      } else {
        await createItem<T>(url, body);
        toast.success(`Added ${itemName}`);
      }
      onClose();
    } catch (error) {
      toast.error((error as Error).message);
    }
  });

  return (
    <Dialog fullWidth maxWidth={maxWidth} open={open} onClose={onClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          {item ? 'Edit' : 'Add'} {itemName}
        </DialogTitle>

        <DialogContent sx={{ pt: '8px !important' }}>
          <FormFields fields={allFields} />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {item ? 'Save changes' : `Add ${itemName}`}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

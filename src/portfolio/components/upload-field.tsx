import { useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { uploadFile } from '../api';
import { driveImage } from '../drive';

// ----------------------------------------------------------------------

type Props = {
  name: string;
  label: string;
  helperText?: string;
  /** "image" shows a preview thumbnail; "file" (e.g. a PDF résumé) does not. */
  kind?: 'image' | 'file';
  /** File picker filter; defaults depend on `kind`. */
  accept?: string;
};

/** URL text field with an upload button — paste a link or upload to the backend. */
export function UploadField({ name, label, helperText, kind = 'image', accept }: Props) {
  const { control, setValue } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setValue(name, url, { shouldDirty: true, shouldValidate: true });
      toast.success('File uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {kind === 'image' && (
            <Avatar
              variant="rounded"
              src={driveImage(field.value)}
              sx={{ width: 56, height: 56, bgcolor: 'background.neutral' }}
            >
              <Iconify icon="solar:gallery-add-bold" />
            </Avatar>
          )}

          <TextField
            {...field}
            value={field.value ?? ''}
            fullWidth
            label={label}
            placeholder="https://… or upload a file"
            error={!!error}
            helperText={error?.message ?? helperText}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {field.value && (
                      <IconButton
                        size="small"
                        aria-label="Clear"
                        onClick={() => setValue(name, '', { shouldDirty: true })}
                      >
                        <Iconify icon="mingcute:close-line" width={18} />
                      </IconButton>
                    )}
                    <IconButton
                      aria-label="Upload"
                      disabled={uploading}
                      onClick={() => inputRef.current?.click()}
                    >
                      {uploading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Iconify icon="eva:cloud-upload-fill" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <input
            ref={inputRef}
            hidden
            type="file"
            accept={accept ?? (kind === 'image' ? 'image/*' : 'image/*,application/pdf')}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </Box>
      )}
    />
  );
}

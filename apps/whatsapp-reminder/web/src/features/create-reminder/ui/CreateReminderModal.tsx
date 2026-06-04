import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CalendarPlus } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Button } from '@/shared/ui/Button';
import { REMINDERS_COPY } from '@/shared/config/copy/app';
import { RecurrenceSelector } from './RecurrenceSelector';
import { ReminderDTO } from '@ingetin/types';
import { recurrenceToInterval, intervalToRecurrence } from '../lib/recurrence';

import { useCreateReminder, useUpdateReminder } from '@/entities/reminder/model/hooks';

const reminderSchema = z.object({
  title: z.string().min(3, REMINDERS_COPY.create_modal.validation.title_min),
  message: z.string().min(5, REMINDERS_COPY.create_modal.validation.message_min),
  date: z.string().optional(),
  time: z.string().min(1, REMINDERS_COPY.create_modal.validation.time_required),
  recurrence: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  selectedDays: z.array(z.number()),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: ReminderFormValues) => void;
  initialData?: ReminderDTO | null;
}

export const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const createReminderMutation = useCreateReminder();
  const updateReminderMutation = useUpdateReminder();
  const { control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: '',
      message: '',
      date: '',
      time: '',
      recurrence: 'ONCE',
      selectedDays: [],
    }
  });

  useEffect(() => {
    if (isOpen && initialData) {
      // Handle date string/date object robustly
      const scheduleDate = typeof initialData.schedule === 'string'
        ? parseISO(initialData.schedule)
        : new Date(initialData.schedule);

      const formRecurrence = intervalToRecurrence(initialData.repeat);

      if (isValid(scheduleDate)) {
        reset({
          title: initialData.title,
          message: initialData.message,
          date: format(scheduleDate, 'yyyy-MM-dd'),
          time: format(scheduleDate, 'HH:mm'),
          recurrence: formRecurrence,
          selectedDays: initialData.daysOfWeek || [],
        });
      }
    } else if (!isOpen) {
      reset({
        title: '',
        message: '',
        date: '',
        time: '',
        recurrence: 'ONCE',
        selectedDays: [],
      });
    }
  }, [isOpen, initialData, reset]);

  const recurrence = watch('recurrence');
  const selectedDays = watch('selectedDays');

  const onSubmit = async (data: ReminderFormValues) => {
    try {
      // Create combined schedule ISO string robustly
      const baseDate = data.date ? parseISO(data.date) : new Date();
      const [hours, minutes] = data.time.split(':').map(Number);

      const scheduleDate = new Date(baseDate);
      scheduleDate.setHours(hours, minutes, 0, 0);

      const isoSchedule = scheduleDate.toISOString();
      const repeat = recurrenceToInterval(data.recurrence);

      if (initialData) {
        await updateReminderMutation.mutateAsync({
          id: initialData.id,
          data: {
            title: data.title,
            message: data.message,
            schedule: isoSchedule,
            repeat,
            daysOfWeek: data.selectedDays,
          }
        });
        toast.success(REMINDERS_COPY.create_modal.toast.update_success, {
          description: REMINDERS_COPY.create_modal.toast.update_desc
        });
      } else {
        await createReminderMutation.mutateAsync({
          title: data.title,
          message: data.message,
          schedule: isoSchedule,
          repeat,
          daysOfWeek: data.selectedDays,
        });
        toast.success(REMINDERS_COPY.create_modal.toast.create_success, {
          description: REMINDERS_COPY.create_modal.toast.create_desc
        });
      }

      onSuccess(data);
    } catch (err: unknown) {
      const error = err as import('axios').AxiosError<{error: string}>;
      toast.error(REMINDERS_COPY.create_modal.toast.error_title, {
        description: error.response?.data?.error || error.message || REMINDERS_COPY.create_modal.toast.error_generic
      });
    }
  };

  const isSubmitting = createReminderMutation.isPending || updateReminderMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Agenda" : REMINDERS_COPY.create_modal.title}
      icon={<CalendarPlus className="text-wa-icon" />}
      maxWidth="max-w-[560px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2 text-left">

        <div className="space-y-5">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                  {...field}
                  label={REMINDERS_COPY.create_modal.input_title}
                  placeholder={REMINDERS_COPY.create_modal.placeholder_title}
                  error={errors.title?.message}
              />
            )}
          />

          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <Textarea
                  {...field}
                  label={REMINDERS_COPY.create_modal.label_message}
                  placeholder={REMINDERS_COPY.create_modal.placeholder_message}
                  error={errors.message?.message}
              />
            )}
          />

          <Controller
              name="recurrence"
              control={control}
              render={({ field }) => (
              <RecurrenceSelector
                  value={field.value}
                  onChange={field.onChange}
                  selectedDays={selectedDays}
                  onDayToggle={(day) => {
                  const newDays = selectedDays.includes(day)
                      ? selectedDays.filter(d => d !== day)
                      : [...selectedDays, day];
                  setValue('selectedDays', newDays);
                  }}
              />
              )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(recurrence === 'ONCE' || recurrence === 'MONTHLY' || recurrence === 'YEARLY') && (
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    label={recurrence === 'ONCE' ? REMINDERS_COPY.create_modal.label_date_once : REMINDERS_COPY.create_modal.label_date_recur}
                    error={errors.date?.message}
                  />
                )}
              />
            )}
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="time"
                  label={REMINDERS_COPY.create_modal.label_time}
                  error={errors.time?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="pt-6 mt-4 border-t border-wa-border flex items-center justify-end gap-3 rounded-none">
            <Button
                type="button"
                variant="ghost"
                onClick={onClose}
            >
                Batal
            </Button>
            <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
            >
                {REMINDERS_COPY.create_modal.btn_submit}
            </Button>
        </div>
      </form>
    </Modal>
  );
};

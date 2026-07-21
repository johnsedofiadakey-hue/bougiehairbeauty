import { NextResponse } from 'next/server';
import { startOfDay, endOfDay, parseISO, addMinutes, format, isWithinInterval } from 'date-fns';
import { readStore } from '@/lib/data-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  const staffId = searchParams.get('staffId');

  if (!dateStr) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

  try {
    const targetDate = parseISO(dateStr);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    const store = await readStore();
    const resolvedStaffId = staffId && staffId !== "solo-staff-id"
      ? staffId
      : store.staff.find((member) => member.isActive)?.id;

    const appointments = store.appointments.filter((apt) => {
      const start = new Date(apt.startTime);
      return (
        start >= dayStart &&
        start <= dayEnd &&
        apt.status !== 'CANCELLED' &&
        (!resolvedStaffId || apt.staffId === resolvedStaffId)
      );
    });

    // Generate slots every 30 minutes from 09:00 to 19:00 (9am-7pm)
    const slots = [];
    let current = addMinutes(dayStart, 9 * 60); // 09:00
    const finish = addMinutes(dayStart, 19 * 60); // 19:00
    const now = new Date();

    while (current < finish) {
      // Don't offer same-day slots that have already passed.
      if (current > now) {
        const timeStr = format(current, 'HH:mm');
        const isBooked = appointments.some(apt => {
          const aptStart = new Date(apt.startTime);
          const aptEnd = new Date(apt.endTime);
          const bufferStart = addMinutes(aptStart, -15); // Buffer before
          const bufferEnd = addMinutes(aptEnd, 15); // Buffer after

          return isWithinInterval(current, { start: bufferStart, end: bufferEnd });
        });

        if (!isBooked) slots.push(timeStr);
      }
      current = addMinutes(current, 30);
    }

    return NextResponse.json(slots);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

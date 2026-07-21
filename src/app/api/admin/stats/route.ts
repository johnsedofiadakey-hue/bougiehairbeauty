import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { startOfMonth, subMonths, addMonths, format } from 'date-fns';
import { readStore } from '@/lib/data-store';

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function inRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr);
  return d >= start && d < end;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const store = await readStore();
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const nextMonthStart = addMonths(thisMonthStart, 1);
    const prevMonthStart = subMonths(thisMonthStart, 1);

    const totalRevenue = store.appointments
      .filter((apt) => ['COMPLETED', 'CONFIRMED', 'PENDING'].includes(apt.status))
      .reduce((sum, apt) => sum + apt.totalPrice, 0);

    const revenueInRange = (start: Date, end: Date) =>
      store.appointments
        .filter((apt) => apt.status !== 'CANCELLED' && inRange(apt.startTime, start, end))
        .reduce((sum, apt) => sum + apt.totalPrice, 0);

    // Last 6 months of revenue (oldest to newest) for the dashboard chart.
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const monthStart = subMonths(thisMonthStart, 5 - i);
      const monthEnd = addMonths(monthStart, 1);
      return { label: format(monthStart, 'MMM'), revenue: revenueInRange(monthStart, monthEnd) };
    });

    const newClientsInRange = (start: Date, end: Date) =>
      store.clients.filter((client) => {
        const user = store.users.find((item) => item.id === client.userId);
        return user && inRange(user.createdAt, start, end);
      }).length;

    const appointmentsInRange = (start: Date, end: Date) =>
      store.appointments.filter((apt) => inRange(apt.createdAt, start, end)).length;

    const newClientsCount = newClientsInRange(thisMonthStart, nextMonthStart);
    const appointmentsThisMonth = appointmentsInRange(thisMonthStart, nextMonthStart);

    const trends = {
      revenue: pctChange(revenueInRange(thisMonthStart, nextMonthStart), revenueInRange(prevMonthStart, thisMonthStart)),
      appointments: pctChange(appointmentsThisMonth, appointmentsInRange(prevMonthStart, thisMonthStart)),
      newClients: pctChange(newClientsCount, newClientsInRange(prevMonthStart, thisMonthStart)),
    };

    const serviceCounts = new Map<string, number>();
    for (const apt of store.appointments) {
      for (const serviceId of apt.serviceIds) {
        serviceCounts.set(serviceId, (serviceCounts.get(serviceId) || 0) + 1);
      }
    }
    const totalBookings = Array.from(serviceCounts.values()).reduce((sum, count) => sum + count, 0);
    const popularServices = store.services.map((service) => ({
      name: service.name,
      share: totalBookings > 0 ? Math.round(((serviceCounts.get(service.id) || 0) / totalBookings) * 100) : 0,
      color: "bg-brand-primary"
    })).sort((a, b) => b.share - a.share).slice(0, 3);

    return NextResponse.json({
      currencySymbol: store.settings.currencySymbol,
      totalRevenue,
      appointmentCount: store.appointments.length,
      newClientsCount,
      monthlyRevenue,
      trends,
      popularServices,
      alerts: {
        lowStock: store.inventory.filter((item) => item.quantity <= item.minThreshold).length,
        pendingAppointments: store.appointments.filter((apt) => apt.status === 'PENDING').length
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

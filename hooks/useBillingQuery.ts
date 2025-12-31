import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Payment {
    id: string;
    created_at: string;
    description?: string;
    amount: number;
    total?: number;
    status: string;
    due_date?: string;
    payment_method?: string;
    client_id?: string;
}

interface BillingData {
    payments: Payment[];
    totalOutstanding: number;
}

export function useBillingQuery() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['billing', user?.email],
        queryFn: async (): Promise<BillingData> => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) return { payments: [], totalOutstanding: 0 };

            // 1. Get Client ID
            const { data: clientData } = await supabase
                .from('client')
                .select('id')
                .eq('email', session.user.email)
                .single();

            if (!clientData) {
                return { payments: [], totalOutstanding: 0 };
            }

            // 2. Get Payments
            const { data: paymentsData, error } = await supabase
                .from('payments')
                .select('*')
                .eq('client_id', clientData.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const fetchedPayments: Payment[] = paymentsData || [];

            // 3. Calculate Outstanding
            const outstanding = fetchedPayments
                .filter(p => p.status === 'pending' || p.status === 'billed' || p.status === 'due')
                .reduce((sum, p) => sum + (p.total || p.amount || 0), 0);

            return {
                payments: fetchedPayments,
                totalOutstanding: outstanding
            };
        },
        enabled: !!user?.email,
        staleTime: 5 * 60 * 1000,
    });
}

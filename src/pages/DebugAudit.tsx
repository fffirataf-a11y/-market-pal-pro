import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePurchases } from '@/hooks/usePurchases';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { db } from '@/config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const DebugAudit = () => {
    const { plan, dailyLimit } = useSubscription();
    const { customerInfo } = usePurchases();
    const { currentUser } = useAuth();
    const [logs, setLogs] = useState<string[]>([]);
    const [firestorePlan, setFirestorePlan] = useState<string>('loading...');

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    // Capture console logs override
    useEffect(() => {
        const originalLog = console.log;
        console.log = (...args) => {
            // originalLog(...args); // Keep original
            const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
            if (msg.includes('Syncing') || msg.includes('RevenueCat') || msg.includes('Ads')) {
                setLogs(prev => [`[CONSOLE] ${msg}`, ...prev]);
            }
        };
        return () => { console.log = originalLog; };
    }, []);

    const checkFirestore = async () => {
        if (!currentUser) return;
        const ref = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            setFirestorePlan(snap.data().subscription?.plan || 'undefined');
        }
    };

    const forcePremium = async () => {
        if (!currentUser) return;
        addLog('Simulating Bug: Forcing Firestore to PREMIUM...');
        const ref = doc(db, 'users', currentUser.uid);
        await updateDoc(ref, {
            'subscription.plan': 'premium'
        });
        addLog('Done. Please reload page now.');
        checkFirestore();
    };

    useEffect(() => {
        checkFirestore();
    }, [currentUser]);

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold font-mono">Build 86 Audit Console</h1>

            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border-2 border-blue-500">
                    <h2 className="text-xl font-bold">App State</h2>
                    <div className="text-4xl font-black mt-2 text-primary">{plan.toUpperCase()}</div>
                    <div>Daily Limit: {dailyLimit}</div>
                </Card>

                <Card className="p-4 border-2 border-orange-500">
                    <h2 className="text-xl font-bold">Firestore State</h2>
                    <div className="text-4xl font-black mt-2 text-orange-600">{firestorePlan.toUpperCase()}</div>
                    <Button onClick={checkFirestore} variant="outline" size="sm" className="mt-2">Refresh DB View</Button>
                </Card>
            </div>

            <Card className="p-4 border-red-500 bg-red-50">
                <h2 className="text-xl font-bold text-red-700">⚠️ Danger Zone (Test 1)</h2>
                <p className="mb-4">Click below to simulate the 'Premium Bug'. It will set Firestore to Premium while RevenueCat is empty.</p>
                <Button onClick={forcePremium} variant="destructive">Force Firestore: PREMIUM</Button>
                <p className="mt-2 text-sm text-muted-foreground">After clicking, reload the page. The App should auto-downgrade back to FREE.</p>
            </Card>

            <Card className="p-4 bg-black text-green-400 font-mono text-sm h-64 overflow-auto">
                <h3 className="text-white font-bold border-b border-gray-700 mb-2">Live Audit Logs</h3>
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </Card>
        </div>
    );
};

export default DebugAudit;

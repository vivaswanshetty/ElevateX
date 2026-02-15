import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { createTask, getTasks, applyForTask as apiApply, assignTask as apiAssign, completeTask as apiComplete, addTaskMessage as apiAddTaskMessage, updateTask as apiUpdate, deleteTask as apiDelete } from '../api/tasks';

import { getTransactions, depositCoins as apiDeposit, withdrawCoins as apiWithdraw, createRazorpayOrder, verifyRazorpayPayment } from '../api/transactions';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { currentUser, refreshProfile } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksData, txsData] = await Promise.all([
                    getTasks(),
                    currentUser ? getTransactions() : Promise.resolve([])
                ]);
                setTasks(tasksData);
                setTransactions(txsData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const postTask = async (taskData) => {
        if (!currentUser) throw new Error('Must be logged in');
        try {
            const newTask = await createTask(taskData);
            setTasks(prev => [newTask, ...prev]);

            // Refresh transactions to show escrow lock
            const txs = await getTransactions();
            setTransactions(txs);

            // Refresh user profile to get updated coins/xp
            if (refreshProfile) {
                await refreshProfile();
            }

            return newTask;
        } catch (error) {
            throw error.response?.data?.message || "Failed to post task";
        }
    };

    const applyForTask = async (taskId) => {
        if (!currentUser) throw new Error('Must be logged in');
        try {
            const updatedTask = await apiApply(taskId);
            setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
        } catch (error) {
            throw error.response?.data?.message || "Failed to apply";
        }
    };

    const assignTask = async (taskId, applicantId) => {
        if (!currentUser) throw new Error('Must be logged in');
        try {
            const updatedTask = await apiAssign(taskId, applicantId);
            setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
        } catch (error) {
            throw error.response?.data?.message || "Failed to assign";
        }
    };

    const completeTask = async (taskId) => {
        if (!currentUser) throw new Error('Must be logged in');
        try {
            const updatedTask = await apiComplete(taskId);
            setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));

            // Refresh transactions
            const txs = await getTransactions();
            setTransactions(txs);
        } catch (error) {
            throw error.response?.data?.message || "Failed to complete task";
        }
    };

    const addChatMessage = async (taskId, text) => {
        if (!currentUser) throw new Error('Must be logged in');
        try {
            // We don't need to update state here because TaskDetailModal fetches its own data
            // But if we wanted to update the global tasks list:
            // const updatedTask = await apiAddTaskMessage(taskId, text);
            // setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));

            // However, since we are using a separate API call in the component for real-time-ish updates,
            // we can just return the promise.
            // Wait, actually TaskDetailModal calls this. Let's make it return the updated task.

            const updatedTask = await apiAddTaskMessage(taskId, text);
            setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
            return updatedTask;
        } catch (error) {
            console.error("Failed to send message", error);
            throw error;
        }
    };

    const updateTask = async (taskId, taskData) => {
        if (!currentUser) throw new Error('Must be logged in');
        try {
            const updatedTask = await apiUpdate(taskId, taskData);
            setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));

            // Refresh user profile to get updated coins if changed
            if (refreshProfile) {
                await refreshProfile();
            }
            // Refresh transactions if any were created
            const txs = await getTransactions();
            setTransactions(txs);

            return updatedTask;
        } catch (error) {
            throw error.response?.data?.message || "Failed to update task";
        }
    };

    const deleteTask = async (taskId) => {
        if (!currentUser) throw new Error('Must be logged in');
        try {
            await apiDelete(taskId);
            setTasks(prev => prev.filter(t => t._id !== taskId));

            // Refresh transactions to show refund if any
            const txs = await getTransactions();
            setTransactions(txs);

            // Refresh user profile to get updated coins
            if (refreshProfile) {
                await refreshProfile();
            }

        } catch (error) {
            throw error.response?.data?.message || "Failed to delete task";
        }
    };

    const initiateDeposit = async (amount) => {
        if (!currentUser) throw new Error('Must be logged in');
        try {
            // 1. Create Order
            const { orderId, keyId, amount: orderAmount, currency } = await createRazorpayOrder(amount);

            // 2. Open Razorpay Popup
            const options = {
                key: keyId,
                amount: orderAmount,
                currency: currency,
                name: "ElevateX",
                description: "Purchase ElevateX Coins",
                image: "https://elevatex-platform.vercel.app/logo.png", // Replace with your logo
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: amount
                        });

                        // 4. Refresh Data
                        if (refreshProfile) await refreshProfile();
                        const txs = await getTransactions();
                        setTransactions(txs);

                        // We use a custom event or callback if needed, but for now we just rely on state update
                        // The component calling this will need to handle success UX based on promise resolution
                        return true;
                    } catch (verifyError) {
                        console.error("Payment Verification Failed", verifyError);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: currentUser.name,
                    email: currentUser.email,
                    contact: "" // You can add phone if you have it
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error("Deposit Initiation Failed", error);
            throw error.response?.data?.message || "Failed to initiate deposit";
        }
    };

    // No longer needed for frontend calls, internalized in initiateDeposit handler
    const verifyDeposit = async () => { };

    const depositCoins = async (amount) => {
        // Legacy deposit (used for testing if Stripe fails) - or we can keep it for admin
        return initiateDeposit(amount);
    };

    const withdrawCoins = async (amount) => {
        if (!currentUser) return;

        // Optimistic update
        const tempTx = {
            _id: 'temp-' + Date.now(),
            user: currentUser._id,
            type: 'withdraw',
            amount: Number(amount),
            description: 'Withdraw',
            createdAt: new Date().toISOString()
        };
        setTransactions(prev => [tempTx, ...prev]);

        try {
            await apiWithdraw(amount);

            // Background refresh
            (async () => {
                try {
                    if (refreshProfile) await refreshProfile();
                    // Small delay for DB consistency
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const txs = await getTransactions();
                    setTransactions(txs);
                } catch (err) {
                    console.error("Background refresh failed", err);
                }
            })();

            return amount;
        } catch (error) {
            console.error("Withdraw failed", error);
            // Rollback on error
            setTransactions(prev => prev.filter(t => t._id !== tempTx._id));
            throw error.response?.data?.message || "Withdraw failed";
        }
    };

    return (
        <DataContext.Provider value={{
            tasks,
            transactions,
            postTask,
            applyForTask,
            assignTask,
            completeTask,
            addChatMessage,

            depositCoins,
            initiateDeposit,
            verifyDeposit,
            withdrawCoins,
            updateTask,
            deleteTask,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};

"use client"
import { UserDetailContext } from '@/context/UserDetailContext';
import axios from 'axios'
import React, { useEffect, useState } from 'react'

function Provider({ children }: { children: React.ReactNode }) {
    const [userDetail, setUserDetail] = useState<any>();

    useEffect(() => {
        const fetchOrCreateUser = async () => {
            try {
                const result = await axios.get('/api/users');
                setUserDetail(result.data);
            } catch (e) {
                try {
                    const postResult = await axios.post('/api/users');
                    setUserDetail(postResult.data);
                } catch (err) {
                }
            }
        };

        fetchOrCreateUser();
    }, []);

    return (
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
            <div>{children}</div>
        </UserDetailContext.Provider>
    )
}

export default Provider
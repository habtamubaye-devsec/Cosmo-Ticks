import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // Store the token in localStorage
            localStorage.setItem('token', token);

            // Redirect to home page
            navigate('/', { replace: true });

            // Optionally reload to update auth state
            window.location.reload();
        } else {
            // If no token, redirect to login
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            <Spin size="large" tip="Logging you in..." />
        </div>
    );
};

export default OAuthCallback;

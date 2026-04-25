import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const SellerProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    if (!currentUser || currentUser.role !== 'seller') {
        return <Navigate to="/seller/login" state={{ from: location }} replace />;
    }

    return children;
};

export const AdminProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    if (!currentUser || currentUser.role !== 'admin') {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};

export const CustomerProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    if (!currentUser || (currentUser.role !== 'customer' && currentUser.role !== 'admin')) {
        return <Navigate to="/customer-login" state={{ from: location }} replace />;
    }

    return children;
};

export const PublicRoute = ({ children, restrictedTo = null }) => {
    const { currentUser } = useAuth();

    if (currentUser) {
        if (currentUser.role === 'admin') {
            return <Navigate to="/" replace />;
        }
        if (currentUser.role === 'seller') {
            return <Navigate to="/seller" replace />;
        }
        if (currentUser.role === 'customer') {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

import './PageLayout.css';
import { Outlet, useNavigate } from 'react-router-dom';

interface PageLayoutProps {
    children?: React.ReactNode;
    title?: string;
}

export default function PageLayout({ children, title = "Credit Payment" }: PageLayoutProps) {
    
    const navigate = useNavigate();
    const handlerTitleClick = () => {
        navigate("/");
    }
    
    return (
        <div className="page-layout">
            <nav className="navbar">
                <div className="navbar-content">
                    <h1 className="page-title" onClick={handlerTitleClick}>{title}</h1>
                    <div className="navbar-actions">
                        <button className="cart-button" aria-label="Carrito de compras">
                            <svg 
                                className="cart-icon" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                            >
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="m16 10a4 4 0 0 1-8 0"/>
                            </svg>
                            <span className="cart-count">0</span>
                        </button>
                    </div>
                </div>
            </nav>
            <main className="page-content">
                {children || <Outlet />}
            </main>
        </div>
    );
}
import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { updateProfile } from '../services/apiService';
import { toast } from 'react-toastify';
import { 
  IconLayoutDashboard, 
  IconPlant, 
  IconBulb, 
  IconHistory, 
  IconChartBar, 
  IconUser, 
  IconLogout, 
  IconMapPin,
  IconMapPinFilled,
  IconAlertTriangle
} from '@tabler/icons-react';

const Navbar = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [detecting, setDetecting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      fallbackToIPLocation();
      return;
    }

    setDetecting(true);
    toast.info('Detecting location...', { autoClose: 1500 });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`);
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const components = data.results[0].address_components;
            let state = '';
            let district = '';

            components.forEach(comp => {
              if (comp.types.includes('administrative_area_level_1')) {
                state = comp.long_name;
              }
              if (comp.types.includes('administrative_area_level_2') || (!district && comp.types.includes('locality'))) {
                district = comp.long_name;
              }
            });
            
            district = district.replace(' District', '');

            if (state || district) {
              await updateProfile({ state, district });
              setUser(prev => ({ ...prev, state, district }));
              toast.success(`Location updated to ${district}, ${state}`);
            }
          } else {
            fallbackToIPLocation();
          }
        } catch (error) {
          fallbackToIPLocation();
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        fallbackToIPLocation();
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fallbackToIPLocation = async () => {
    try {
      const token = import.meta.env.VITE_IPINFO_TOKEN;
      const response = await fetch(`https://ipinfo.io/json?token=${token}`);
      const data = await response.json();
      const state = data.region || '';
      const district = data.city || '';
      if (state || district) {
        await updateProfile({ state, district });
        setUser(prev => ({ ...prev, state, district }));
        toast.success(`Approximate location updated to ${district}, ${state}`);
      }
    } catch (error) {
      toast.error('Failed to detect location automatically.');
    }
  };

  return (
    <aside className="sidebar">
      <Link className="sidebar-logo" to="/">🌿 YieldX</Link>
      
      {user && (
        <>
          <nav className="sidebar-nav">
            <Link className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard">
              <IconLayoutDashboard size={20} stroke={1.5} /> Dashboard
            </Link>
            <Link className={`sidebar-link ${location.pathname === '/predict' ? 'active' : ''}`} to="/predict">
              <IconPlant size={20} stroke={1.5} /> Predict
            </Link>
            <Link className={`sidebar-link ${location.pathname === '/recommend' ? 'active' : ''}`} to="/recommend">
              <IconBulb size={20} stroke={1.5} /> Recommend
            </Link>
            <Link className={`sidebar-link ${location.pathname === '/history' ? 'active' : ''}`} to="/history">
              <IconHistory size={20} stroke={1.5} /> History
            </Link>
            <Link className={`sidebar-link ${location.pathname === '/analytics' ? 'active' : ''}`} to="/analytics">
              <IconChartBar size={20} stroke={1.5} /> Analytics
            </Link>
            <Link className={`sidebar-link ${location.pathname === '/alerts' ? 'active' : ''}`} to="/alerts">
              <IconAlertTriangle size={20} stroke={1.5} /> Alerts
            </Link>
          </nav>
          
          <div className="sidebar-footer">
            <button 
              className="sidebar-btn"
              onClick={handleDetectLocation}
              disabled={detecting}
              title="Auto-detect Location"
            >
              {detecting ? (
                <span>...</span>
              ) : (
                <IconMapPin size={20} stroke={1.5} />
              )}
              {user.district || user.state ? (user.district || user.state) : "Set Location"}
            </button>
            
            <Link className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`} to="/profile">
              <IconUser size={20} stroke={1.5} /> Profile
            </Link>
            <button className="sidebar-btn" onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
              <IconLogout size={20} stroke={1.5} /> Logout
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default Navbar;

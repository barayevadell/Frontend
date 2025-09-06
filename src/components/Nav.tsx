import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Divider,
  Toolbar,
} from '@mui/material';
import { ENTITIES } from '@config/entities';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCreatePath, getListPath } from '@lib/routing';

const drawerWidth = 260;

type NavProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const Nav: React.FC<NavProps> = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const content = (
    <div>
      <Toolbar />
      <Divider />
      <List subheader={<ListSubheader>Entities</ListSubheader>} aria-label="Main navigation">
        {ENTITIES.map((e) => (
          <React.Fragment key={e.key}>
            <ListItem disablePadding>
              <ListItemText primary={e.label} sx={{ pl: 2, py: 1, fontWeight: 600 }} />
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === getListPath(e.key)}
                onClick={() => {
                  navigate(getListPath(e.key));
                  onClose();
                }}
                aria-label={`Go to ${e.label} list`}
              >
                <ListItemText primary="List" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === getCreatePath(e.key)}
                onClick={() => {
                  navigate(getCreatePath(e.key));
                  onClose();
                }}
                aria-label={`Create new ${e.label}`}
              >
                <ListItemText primary="New" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  return (
    <nav aria-label="sidebar navigation">
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
      >
        {content}
      </Drawer>
    </nav>
  );
};

export default Nav;



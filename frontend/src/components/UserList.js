import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function UserList() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '' });
  const { githubToken, logout } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/contents/data/users.json`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      const content = Buffer.from(response.data.content, 'base64').toString();
      setUsers(JSON.parse(content));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [githubToken]);

  const handleAddUser = async () => {
    try {
      // קודם נקבל את ה-SHA של הקובץ הנוכחי
      const getResponse = await axios.get(
        `https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/contents/data/users.json`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      const currentContent = Buffer.from(getResponse.data.content, 'base64').toString();
      const currentUsers = JSON.parse(currentContent);
      
      const updatedUsers = [
        ...currentUsers,
        {
          id: Date.now().toString(),
          ...newUser,
          createdAt: new Date().toISOString(),
        },
      ];

      // מעדכנים את הקובץ ב-GitHub
      await axios.put(
        `https://api.github.com/repos/${process.env.REACT_APP_GITHUB_OWNER}/${process.env.REACT_APP_GITHUB_REPO}/contents/data/users.json`,
        {
          message: 'Add new user',
          content: Buffer.from(JSON.stringify(updatedUsers, null, 2)).toString('base64'),
          sha: getResponse.data.sha,
        },
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      setOpen(false);
      setNewUser({ name: '', email: '', phone: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" component="h1">
            ניהול משתמשים
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
              sx={{ ml: 2 }}
            >
              הוסף משתמש
            </Button>
            <Button variant="outlined" color="secondary" onClick={logout}>
              התנתק
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>שם</TableCell>
                <TableCell>אימייל</TableCell>
                <TableCell>טלפון</TableCell>
                <TableCell>תאריך הוספה</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('he-IL')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>הוספת משתמש חדש</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם"
            fullWidth
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            dir="rtl"
          />
          <TextField
            margin="dense"
            label="אימייל"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            dir="rtl"
          />
          <TextField
            margin="dense"
            label="טלפון"
            fullWidth
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            dir="rtl"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={handleAddUser} variant="contained">
            הוסף
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default UserList; 
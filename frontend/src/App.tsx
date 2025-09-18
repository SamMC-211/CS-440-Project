import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Home from './Home';
import Login from './Login';
import UserHome from './UserHome';
// MUI Rec.
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// Login with Backend
import RequireAuth from './components/RequireAuth';

const theme = createTheme({
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    margin: 0,
                    padding: 0,
                    backgroundColor: 'transparent', // or your bg
                },
                '#root': {
                    margin: 0,
                    padding: 0,
                    minHeight: '100vh',
                },
            },
        },
    },
    palette: {
        primary: {
            main: '#a93331', // your custom color
        },
        text: {
            // primary: '#a93331',
            // secondary: '#131618',
        },
    },
});

function App() {
    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Routes>
                        <Route path='/' element={<Home />}></Route>
                        <Route path='/Login' element={<Login />}></Route>
                        <Route
                            path='/Home'
                            element={
                                <RequireAuth>
                                    <UserHome />
                                </RequireAuth>
                            }
                        />
                    </Routes>
                </Router>
            </ThemeProvider>
        </>
    );
}

export default App;

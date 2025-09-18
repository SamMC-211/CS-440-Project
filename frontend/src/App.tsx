import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Home from './Home';
import Login from './Login';
// MUI Rec.
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
                    </Routes>
                </Router>
            </ThemeProvider>
        </>
    );
}

export default App;

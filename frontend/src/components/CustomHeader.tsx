import { Box, Typography } from "@mui/material";
import { Link } from "react-router";

interface TitleProps {
  text: string;
  margin?: number;
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "button"
    | "caption"
    | "overline";
}

function CompanyTitle({ text, margin, variant }: TitleProps) {
  return (
    <>
      <Box
        sx={{
          position: "relative",
          display: "inline-block",
          margin: `${margin}px`,
        }}
      >
        {/* Shadow */}
        <Typography
          variant={variant}
          fontWeight="bold"
          sx={{
            position: "absolute",
            // top: "5px",
            // left: '0.01%',
            transform: "translateX(0.06em) translateY(5%)",
            color: "#494746",
            zIndex: 0,
          }}
        >
          {text}
        </Typography>

        {/* Main title */}
        <Typography
          component={Link}
          to="/"
          variant={variant}
          fontWeight="bold"
          sx={{
            position: "relative",
            color: "#a93331",
            zIndex: 1,
            textDecoration: "none",
            // textShadow: "2px 2px 5px rgba(0,0,0,0.4)",
          }}
        >
          {text}
        </Typography>
      </Box>
    </>
  );
}

export default CompanyTitle;

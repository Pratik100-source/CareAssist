import { useSelector } from "react-redux";
import "./loader.css"

const Loader = () => {
  const isLoading = useSelector((state) => state.loader.isLoading);

  if (!isLoading) return null; // Don't render if not loading

  return (
    <div className="loading_overlay">
      <div className="loader"></div>
    </div>
  );
};

export default Loader;

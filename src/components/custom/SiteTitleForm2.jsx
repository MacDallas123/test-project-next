const SiteTileForm2 = ({ size = "text-2xl", LNSize = "text-3xl" }) => {
  return (
    <h1 className={`${size} font-semibold`}>
      <span className={`${LNSize} text-secondary`}>L</span>ivrer
      <span className={`${LNSize} text-secondary`}>N</span>ourriture
    </h1>
  );
};

export default SiteTileForm2;

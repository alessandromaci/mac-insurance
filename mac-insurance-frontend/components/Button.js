import s from "../styles/Button.module.scss";

export const Button = ({ buttonText, handleClick, secondary, disabled }) => {
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={secondary ? s.secondary : s.button}
    >
      {buttonText}
    </button>
  );
};

export interface BtnConfig {
  label?: string;
  icon?: string;
  iconPos?: 'left' | 'right' | 'top' | 'bottom';
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast' | 'help';
  size?: 'small' | 'large';
  outlined?: boolean;
  text?: boolean;
  raised?: boolean;
  rounded?: boolean;
  disabled?: boolean;
  loading?: boolean;
  styleClass?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}
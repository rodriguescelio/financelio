import {
  DefaultMantineColor,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { weekdays } from 'moment';
import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './NavLink.module.css';

interface NavLinkProps {
  color: DefaultMantineColor;
  icon: JSX.Element;
  label: string;
  to?: string;
}

const NavLink: FC<NavLinkProps> = ({ color, icon, label, to }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const theme = useMantineTheme();

  const onClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <UnstyledButton
      onClick={onClick}
      classNames={{
        root: classes.root,
      }}
      styles={{
        root: {
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          backgroundColor: location.pathname === to ? theme.colors.dark[6] : '',
        }
      }}
    >
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
};

export default NavLink;

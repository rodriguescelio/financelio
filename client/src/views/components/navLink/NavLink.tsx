import {
  DefaultMantineColor,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavLinkProps {
  color: DefaultMantineColor;
  icon: JSX.Element;
  label: string;
  to?: string;
}

const NavLink: FC<NavLinkProps> = ({ color, icon, label, to }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const onClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <UnstyledButton
      onClick={onClick}
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        marginBottom: 5,
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colors.dark[0],
        backgroundColor: location.pathname === to ? theme.colors.dark[6] : '',
        '&:hover': {
          backgroundColor: theme.colors.dark[6],
        },
      })}
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

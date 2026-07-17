// Single icon registry. Import MUI icons ONCE here and re-export with semantic names.
// Everywhere else, import { Icons } from '@/lib/iconHash' — never from '@mui/icons-material'.
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import SupportIcon from '@mui/icons-material/SupportAgentOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import ShieldIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

export const Icons = {
  Add: AddIcon,
  Delete: DeleteIcon,
  Edit: EditIcon,
  Dashboard: DashboardIcon,
  Menu: MenuIcon,
  Description: DescriptionIcon,
  Email: EmailIcon,
  Support: SupportIcon,
  Event: EventIcon,
  People: PeopleIcon,
  Receipt: ReceiptIcon,
  Calendar: CalendarIcon,
  Shield: ShieldIcon,
  ArrowForward: ArrowForwardIcon,
  Check: CheckIcon,
  ExpandMore: ExpandMoreIcon,
  Close: CloseIcon,
} as const;

export type IconName = keyof typeof Icons;

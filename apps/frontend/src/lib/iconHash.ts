// Single icon registry. Import MUI icons ONCE here and re-export with semantic names.
// Everywhere else, import { Icons } from '@/lib/iconHash' — never from '@mui/icons-material'.
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import TemplatesIcon from '@mui/icons-material/StyleOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import SupportIcon from '@mui/icons-material/SupportAgentOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import ShieldIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import BellIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import HelpIcon from '@mui/icons-material/HelpOutlineOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import SendIcon from '@mui/icons-material/SendOutlined';
import CopyIcon from '@mui/icons-material/ContentCopyOutlined';
import PhoneIcon from '@mui/icons-material/PhoneOutlined';
import ContactIcon from '@mui/icons-material/ContactPhoneOutlined';
import UploadIcon from '@mui/icons-material/FileUploadOutlined';
import BoardIcon from '@mui/icons-material/ViewKanbanOutlined';
import ListIcon from '@mui/icons-material/ViewListOutlined';
import TagIcon from '@mui/icons-material/LocalOfferOutlined';
import ConvertIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import NoteIcon from '@mui/icons-material/StickyNote2Outlined';
import CampaignIcon from '@mui/icons-material/CampaignOutlined';
import MeetingIcon from '@mui/icons-material/GroupsOutlined';
import SmsIcon from '@mui/icons-material/SmsOutlined';
import UpgradeIcon from '@mui/icons-material/WorkspacePremiumOutlined';

export const Icons = {
  Add: AddIcon,
  Delete: DeleteIcon,
  Edit: EditIcon,
  Dashboard: DashboardIcon,
  Menu: MenuIcon,
  Description: DescriptionIcon,
  Templates: TemplatesIcon,
  Email: EmailIcon,
  Support: SupportIcon,
  Event: EventIcon,
  People: PeopleIcon,
  Receipt: ReceiptIcon,
  Calendar: CalendarIcon,
  Shield: ShieldIcon,
  ArrowForward: ArrowForwardIcon,
  ArrowBack: ArrowBackIcon,
  Check: CheckIcon,
  ExpandMore: ExpandMoreIcon,
  Close: CloseIcon,
  Settings: SettingsIcon,
  Bell: BellIcon,
  Search: SearchIcon,
  Logout: LogoutIcon,
  Help: HelpIcon,
  WhatsApp: WhatsAppIcon,
  Download: DownloadIcon,
  Send: SendIcon,
  Copy: CopyIcon,
  Phone: PhoneIcon,
  Contact: ContactIcon,
  Upload: UploadIcon,
  Board: BoardIcon,
  List: ListIcon,
  Tag: TagIcon,
  Convert: ConvertIcon,
  Note: NoteIcon,
  Campaign: CampaignIcon,
  Meeting: MeetingIcon,
  Sms: SmsIcon,
  Upgrade: UpgradeIcon,
} as const;

export type IconName = keyof typeof Icons;

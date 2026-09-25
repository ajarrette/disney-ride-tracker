import { ParkScreen } from '@/components/park-screen';
import { Park } from '@/models/ride';

export default function IndexScreen() {
  return <ParkScreen park={Park.MagicKingdom} />;
}

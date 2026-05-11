import { useAuth } from '../../context/AuthContext';
import { isConstrutoraUser } from '../../lib/portalAccess';
import { ConstrutoraDashboard } from '../construtora/ConstrutoraDashboard';
import { BrokerHome } from './BrokerMvp';

export function HubDashboard() {
    const { user } = useAuth();

    if (isConstrutoraUser(user)) {
        return <ConstrutoraDashboard />;
    }

    return <BrokerHome />;
}

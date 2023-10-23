import ListGeneratorServer from './FnF/Server';
type Permission = number;
const PERMISSIONS : {[key : string] : Permission} = {
    TASK : 1 << 0,
    STATS : 1 << 1,
    CATEGORY : 1 << 2,
    TOPIC : 1 << 3,
    GRANT : 1 << 4,
    REVOKE : 1 << 5,
};
class BaseServer {
    static hasAccess(rights : Permission, permission : Permission){
        return (rights & permission) == permission;
    }
}
export default BaseServer;
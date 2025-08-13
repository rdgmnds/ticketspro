import './sidebar.css';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import { Link } from 'react-router-dom';
import { FiHome, FiUser, FiSettings } from 'react-icons/fi';
import avatarImg from '../../assets/images/avatar.png';

function Sidebar(){
    const { user } = useContext(AuthContext);

    return(
        <div className='sidebar'>
            <div>
                <img src={ user.avatarUrl === null ? avatarImg : user.avatarUrl } alt='Foto do usuário'></img>
            </div>

            <Link to={"/dashboard"}>
                <FiHome color='#FFF' size={24} />
                Chamados
            </Link>

            <Link to={"/customers"}>
                <FiUser color='#FFF' size={24} />
                Clientes
            </Link>

            <Link to={"/profile"}>
                <FiSettings color='#FFF' size={24} />
                Perfil
            </Link>

        </div>

        
    )
}

export default Sidebar;
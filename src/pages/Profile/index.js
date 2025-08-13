import './profile.css';
import { toast } from 'react-toastify';
import avatar from '../../assets/images/avatar.png';
import { FiSettings, FiUpload } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import Title from '../../components/Title';
import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/auth';
import { storage, db } from '../../services/firebaseConnection';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


function Profile(){
    const { user, logout, setUser, userStorage } = useContext(AuthContext);
    const [ avatarUrl, setAvatarUrl ] = useState(user && user.avatarUrl);
    const [ nome, setNome ] = useState(user && user.nome);
    const [ email, setEmail ] = useState(user && user.email);
    const [ avatarImg, setAvatarImg ] = useState(null);
    const [ loadingBtn, setLoadingBtn ] = useState(false);

    
    // DEFINIR NOVA IMAGEM DE PERFIL
    function handleImg(e){
        if (e.target.files[0]){
            const image = e.target.files[0];

            if (image.type === "image/jpeg" || image.type === "/image/png"){
                setAvatarImg(image)
                setAvatarUrl(URL.createObjectURL(image))
            }else{
                toast.error("Selecione um arquivo em formato JPEG ou PNG...");
                setAvatarImg(null);
                return;
            }
        }        
    }


    // SALVA APENAS O NOME ATUALIZADO
    async function nameUpdate(){
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
            nome: nome,
        })
        .then(() => {
            let data = {
                ...user,
                nome: nome,
            }

            setLoadingBtn(false);
            setUser(data);
            userStorage(data);
            toast.success("Nome atualizado com sucesso!");
        })
    }


    // SALVA NOME E FOTO ATUALIZADOS
    async function allUpdate(){
        const currentUid = user.uid;
        const uploadRef = ref(storage, `images/${currentUid}/${avatarImg.name}`)

        const uploadTask = uploadBytes(uploadRef, avatarImg)
        .then((snapshot) => {
            getDownloadURL(snapshot.ref).then( async (downLoadURL) => {
                let urlFoto = downLoadURL;
                const docRef = doc(db, "users", user.uid)

                await updateDoc(docRef, {
                    avatarUrl: urlFoto,
                    nome: nome,
                })
                .then(() => {
                    let data = {
                        ...user,
                        nome: nome,
                        avatarUrl: urlFoto,
                    }

                    setUser(data);
                    userStorage(data);
                    setLoadingBtn(false);
                    toast.success("Dados atualizados com sucesso!");
                })
            })
        })
    }


    // CHAMA AS FUNÇÕES PARA SALVAR AS ALTERAÇÕES
    async function handleSubmit(e){
        e.preventDefault()

        setLoadingBtn(true)

        // se o usuário atualizar apenas o nome
        if (nome !== "" && avatarImg === null){
            nameUpdate();
        }
        // se o usuário atualizar o nome e a foto
        else if (nome !== "" && avatarImg !== null){
            allUpdate();
        }
    }


    return(
        <div>
            <Sidebar/>
            <div className='content'>
                
                <Title name="Minha conta">
                    <FiSettings size={25}/>
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleSubmit}>

                        <label className='label-avatar'>
                            <span>
                                <FiUpload color='#FFF' size={25}/>
                            </span>

                            <input type='file' accept='images/*' onChange={handleImg}/> <br/>
                            {avatarUrl === null ? (
                                <img src={avatar} alt="Foto de perfil do usuário" width={250} height={250}/>
                            ) : (
                                <img src={avatarUrl} alt="Foto de perfil do usuário" width={250} height={250}/>
                            )}

                        </label>

                        <label>Nome</label>
                        <input type='text' value={nome} onChange={ (e) => setNome(e.target.value)}/>

                        <label>E-mail</label>
                        <input type='text' placeholder={email} disabled />   

                        <button type='submit'>
                            {loadingBtn ? "Salvando..." : "Salvar"}
                        </button>

                    </form>
                    
                </div>

                <div className='container'>
                        <button className='btn-logout' onClick={ () => logout() }>Sair da conta</button>
                </div>

            </div>

        </div>
    )
}

export default Profile;
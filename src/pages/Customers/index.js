import './customers.css';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar'
import Title from '../../components/Title';
import { FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { db } from '../../services/firebaseConnection';
import { doc, setDoc } from 'firebase/firestore';

function Customers(){
    const [ empresa, setEmpresa ] = useState("");
    const [ cnpj, setCnpj ] = useState("");
    const [ endereco, setEndereco ] = useState("");   
    const [ loadingBtn, setLoadingBtn ] = useState(false); // alterar status do botão 'salvar'


    async function handleSubmit(e){
        e.preventDefault();

        if (empresa !== "" && cnpj !== "" && endereco !== ""){
            setLoadingBtn(true);

            await setDoc(doc(db, "customers", cnpj), {
                nome: empresa,
                cnpj: cnpj,
                endereco: endereco
            })
            .then(() => {
                toast.success("Cliente cadastrado com sucesso!")
                setEmpresa("");
                setCnpj("");
                setEndereco("");
            })
            .catch((error) => {
                toast.error("Erro ao tentar cadastrar cliente: " + error)
            })

            setLoadingBtn(false);
        }else{
            toast.error("Preencha todos os campos!");
        }
        

    }


    return(
        <div>
            <Sidebar/>
            <div className='content'>

                <Title name="Clientes">
                    <FiUser size={25}/>
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleSubmit}>
                        <label>Nome fantasia</label>
                        <input 
                            type='text'
                            placeholder='Digite o nome da empresa'
                            value={empresa}
                            onChange={(e) => setEmpresa(e.target.value)}
                        />

                        <label>CNPJ</label>
                        <input 
                            type='text'
                            placeholder='Digite apenas números'
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                        />

                        <label>Endereço</label>
                        <input 
                            type='text'
                            placeholder='Digite o endereço completo com CEP'
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                        />

                        <button type='submit'>
                            {loadingBtn ? "Salvando..." : "Salvar"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default Customers;
import './new.css';
import { FiEdit2, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import Title from '../../components/Title';
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../../contexts/auth';


function New(){
    const { user } = useContext(AuthContext); // possui todos os dados do usuário
    const { id } = useParams();

    const [ loadingBtn, setLoadingBtn ] = useState(false); // alterar status do botão
    const [ complement, setComplement ] = useState("");
    const [ customers, setCustomers ] = useState([]); // lista de clientes com os dados do firebase
    const [ subject, setSubject ] = useState("Suporte");
    const [ status, setStatus ] = useState("Aberto");
    const [ loadCustomers, setLoadCustomers ] = useState(true); // verifica se ainda está carregando os clientes
    const [ customerSelected, setCustomerSelected ] = useState(0); // guarda o cliente selecionado 
    const [ isTicketEdit, setIsTicketEdit ] = useState(false);

    const listRef = collection(db, "customers");
    const navigate = useNavigate();


    // BUSCA OS CLIENTES NO FIREBASE
    useEffect(() => {
        async function loadCustomers(){
            const querySnapshot = await getDocs(listRef)
            .then((snapshot) => {
                let lista = [];
                
                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        empresa: doc.data().nome,
                    })
                })

                if (snapshot.docs.size === 0){
                    toast.error("Nenhum cliente encontrado!");
                    setLoadCustomers(false);
                    return;
                }

                setCustomers(lista);
                setLoadCustomers(false);

                if (id){
                    loadId(lista);
                }

            })
            .catch((error) => {
                toast.error("Erro ao buscar clientes: " + error)
                setLoadCustomers(false);
            })
        }

        loadCustomers()
    }, [id])


    // BUSCA O CHAMADO NO FIREBASE DE ACORDO COM O PARAMETRO 'ID' DA URL
    async function loadId(lista){
        const docRef = doc(db, "tickets", id);
        await getDoc(docRef)
        .then((snapshot) => {
            setSubject(snapshot.data().assunto)
            setStatus(snapshot.data().status)
            setComplement(snapshot.data().complemento)

            // buscar o cliente do chamado a ser editado
            let index = lista.findIndex(item => item.id === snapshot.data().clienteId);
            setCustomerSelected(index);
            // informa que se trata de uma atualização de chamado
            setIsTicketEdit(true);
        })
        .catch((error) => {
            toast.error("Erro ao tentar buscar o chamado: " + error);
            setIsTicketEdit(false);
            navigate("/dashboard");
        })
    }


    // ATUALIZA DADOS DO CHAMADO NO DB FIREBASE
    async function ticketEdit(){
        setLoadingBtn(true);

        const docRef = doc(db, "tickets", id);

        await updateDoc(docRef, {
            assunto: subject,
            cliente: customers[customerSelected].empresa,
            clienteId: customers[customerSelected].id,
            complemento: complement,
            status: status,
        })
        .then(() => {
            toast.success("Chamado editado com sucesso!");
            setIsTicketEdit(false);
            setLoadingBtn(false);
        })
        .catch((error) => {
            toast.error("Erro ao tentar editar o chamado: " + error);
            setIsTicketEdit(false);
            setLoadingBtn(false);
        })

    }


    // ATUALIZA O STATUS SELECIONADO
    function handleOptionChange(e){
        setStatus(e.target.value);
    }


    // ATUALIZA O ASSUNTO SELECIONADO
    function handleSelectChange(e){
        setSubject(e.target.value);
    }


    // ATUALIZA O CLIENTE SELECIONADO
    function handleChangeCustomer(e){
        setCustomerSelected(e.target.value);
    }


    // REGISTRA O CHAMADO NO DB FIREBASE
    async function handleSubmit(e){
        e.preventDefault();

        if (isTicketEdit){
            return(await ticketEdit());
        }

        setLoadingBtn(true);

        const docRef = await addDoc(collection(db, "tickets"), {
            cliente: customers[customerSelected].empresa,
            clienteId: customers[customerSelected].id,
            assunto: subject,
            status: status,
            complemento: complement,
            created: new Date(),
            userId: user.uid,
            user: user.nome
        })
        .then(() => {
            toast.success("Chamado criado com sucesso!");
        })
        .catch((error) => {
            toast.error("Erro ao tentar criar chamado: " + error);
        })
            setCustomerSelected(0);
            setSubject("Suporte");
            setStatus("Aberto");
            setComplement("");
            setLoadingBtn(false);
    } 
    

    return(
        <div>
            <Sidebar/>

            <div className='content'>
                <Title name={id ? "Editar chamado" : "Criar chamado"}>
                    {id? <FiEdit2 size={25}/> : <FiPlus size={25}/>}
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleSubmit}>

                        <label>Cliente</label>
                        {
                            loadCustomers ? (
                                <input type='text' disabled value="Carregando..." />
                            ) : (
                                <select value={customerSelected} onChange={handleChangeCustomer}>
                                    {customers.map((item, index) => {
                                        return(
                                            <option key={index} value={index}>
                                                {item.empresa}
                                            </option>
                                        )
                                    })}
                                </select>
                            )
                        }

                        <label>Assunto</label>
                        <select name='Assunto' value={subject} onChange={handleSelectChange}>
                            <option value={"Suporte"}>Suporte técnico</option>
                            <option value={"Financeiro"}>Financeiro</option>
                            <option value={"Comercial"}>Comercial</option>
                            <option value={"RH"}>RH</option>
                            <option value={"Operação"}>Operação</option>
                        </select>

                        <label>Status</label>
                        <div className='status'>
                            <input
                                type='radio'
                                name='radio'
                                value="Aberto"
                                onChange={handleOptionChange}
                                checked={status === "Aberto"}
                            />
                            <span>Em aberto</span>

                            <input
                                type='radio'
                                name='radio'
                                value="Progresso"
                                onChange={handleOptionChange}
                                checked={status === "Progresso"}
                            />
                            <span>Em progresso</span>

                            <input
                                type='radio'
                                name='radio'
                                value="Atendido"
                                onChange={handleOptionChange}
                                checked={status === "Atendido"}
                            />
                            <span>Atendido</span>
                        </div>
                        
                        <label>Complemento</label>
                        <textarea
                            type='text'
                            placeholder='Adicione um complemento (opcional).'
                            value={complement}
                            onChange={ (e) => setComplement(e.target.value) }
                        />

                        <button type='submit'>
                            { loadingBtn && id ? "Editando chamado..." : loadingBtn && !id ? "Criando chamado" : !loadingBtn && !id ? "Criar chamado" : "Editar chamado" }
                        </button>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default New;
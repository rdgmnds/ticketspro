import { useState, useEffect, createContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebaseConnection";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export const AuthContext = createContext({});

function AuthProvider({ children }){
    const [user, setUser] = useState(null); // guardar os dados do usuário logado ou criado
    const [loadingAuth, setLoadingAuth] = useState(false); // mudar o botão de signIn ou signOut para 'carregando...'
    const [loading, setLoading] = useState(true); // verificar se a página está carregando
    const navigate = useNavigate();


    // VERIFICA SE EXISTE DADOS DO USUÁRIO NO LOCAL STORAGE E ATUALIZA (OU MANTÉM) A STATE 'USER'.
    useEffect(() => {
        async function loadUser(){
            const storageUser = localStorage.getItem("@ticketsPRO")

            if (storageUser){
                setUser(JSON.parse(storageUser));
                setLoading(false);
            }

            setLoading(false); 
        }

        loadUser();

    }, [])
    

    // GUARDA OS DADOS DO USUÁRIO (LOGADO OU CRIADO) NO LOCAL STORAGE
    function userStorage(data){
        localStorage.setItem("@ticketsPRO", JSON.stringify(data))
    }


    // ENTRAR
    async function signIn(email, password){
        setLoadingAuth(true);

        await signInWithEmailAndPassword(auth, email, password)
        .then( async (value) => {
            let uid = value.user.uid

            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            let data = {
                uid: uid,
                nome: docSnap.data().nome,
                email: value.user.email,
                avatarUrl: docSnap.data().avatarUrl
            }

            setUser(data);
            userStorage(data);
            navigate("/dashboard");
            setLoadingAuth(false);
            toast.success("Seja bem-vindo(a) de volta!");

        })
        .catch((error) => {
            toast.error("Erro ao tentar entrar: " + error);
            setLoadingAuth(false);
        })
    }   


    // CRIAR CONTA
    async function signUp(email, password, nome){
        setLoadingAuth(true);

        // tenta criar a conta
        await createUserWithEmailAndPassword(auth, email, password)
        .then( async (value) => {
            let uid = value.user.uid

            // tenta criar o doc na coleção
            await setDoc(doc(db, "users", uid), {
                nome: nome,
                email: email,
                avatarUrl: null
            })
            .then(() => {
                let data = {
                    uid: uid,
                    nome: nome,
                    email: email,
                    avatarUrl: null,
                };

                setUser(data);
                setLoadingAuth(false);
                userStorage(data);
                toast.success("Conta criada com sucesso!");
                navigate("/dashboard");

            })
            .catch((error) => {
                toast.error("Erro ao tentar criar a conta: " + error);
            })
        })
        .catch((error) => {
            toast.error("Erro ao tentar criar a conta: " + error)
            setLoadingAuth(false);
        })
    }


    // SAIR DA CONTA
    async function logout(){
        await signOut(auth);
        setLoading(false);
        setUser(null);
        localStorage.removeItem("@ticketsPRO");
    }


    return(
        <AuthContext 
            value={{
                signed: !!user, // deixa o resultado 'dinamico' em formato bool
                user,
                signIn,
                signUp,
                loadingAuth,
                loading,
                logout,
                setUser,
                userStorage,
            }}
        >
            {children}
        </AuthContext>
    )
}


export default AuthProvider;
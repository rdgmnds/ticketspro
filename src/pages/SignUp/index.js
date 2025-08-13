import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';

import logo from '../../assets/images/logo.png';
import './signup.css';

function SignUp(){
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { signUp, loadingAuth } = useContext(AuthContext);

    async function handleSignUp(e){
        e.preventDefault();

        if (nome !== "" && email !== "" && password !== ""){
            await signUp(email, password, nome);
            setNome("");
            setEmail("");
            setPassword("");
        }else{
            toast.warning("Preencha todos os campos!")
        }
    }

    return(
        <div className='signin-container'>
            <div className='login'>
                <div className='login-area'>
                    <img src={logo} alt='Logo do sistema de chamados'></img>
                </div>

                    <form className='form-signin' onSubmit={handleSignUp}>
                        <h1>Criar conta</h1>

                        <input
                            type='text'
                            placeholder='Seu nome'
                            value={nome}
                            onChange={ (e) => setNome(e.target.value) }
                        />

                        <input
                            type='text'
                            placeholder='seu@email.com'
                            value={email}
                            onChange={ (e) => setEmail(e.target.value) }
                        />

                        <input
                            type='password'
                            placeholder='**********'
                            value={password}
                            onChange={ (e) => setPassword(e.target.value) }
                        />

                        <button type='submit'>
                            {loadingAuth ? "Carregando..." : "Cadastrar"}
                        </button>

                        <Link to={"/"}>Já tem uma conta? Faça o login por aqui!</Link>
                    </form>
                
            </div>
        </div>
    )
}

export default SignUp;
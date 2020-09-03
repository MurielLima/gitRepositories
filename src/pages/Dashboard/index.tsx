import React, { useState, FormEvent, useEffect } from "react";
import logoImg from "../../assets/explorer-logo.svg";
import { Title, Form, Repositories, Error } from "./styles";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import api from "../../services/api";

interface Repository {
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
}

const Dashboard: React.FC = () => {
  const [inputError, setInputError] = useState("");
  const [newRepository, setNewRepository] = useState("");
  const [repositories, setRepositories] = useState<Array<Repository>>(() => {
    const storagedRepositories = localStorage.getItem(
      "@GithubExplorer:repositories"
    );
    if (storagedRepositories) {
      return JSON.parse(storagedRepositories);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      "@GithubExplorer:repositories",
      JSON.stringify(repositories)
    );
  }, [repositories]);
  async function handleAddProject(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (!newRepository) {
      setInputError("O formato da busca deve ser 'autor/repositório'.");
      return;
    }
    try {
      const response = await api.get<Repository>(`/repos/${newRepository}`);
      const repository = response.data;
      setRepositories([...repositories, repository]);
      setNewRepository("");
      setInputError("");
    } catch (err) {
      setInputError("Não foi encontrado nenhum repositório com esse nome.");
    }
  }
  return (
    <>
      <img src={logoImg} alt="Github Explorer" />
      <Title>Explore repositórios no Github</Title>
      <Form hasError={!!inputError} onSubmit={handleAddProject}>
        <input
          value={newRepository}
          onChange={(e) => setNewRepository(e.target.value)}
          placeholder="Digite o nome do repositório"
        />
        <button type="submit">Pesquisa</button>
      </Form>
      {inputError && <Error>{inputError}</Error>}
      <Repositories>
        {repositories.map((repo) => (
          <Link key={repo.full_name} to={`/repositories/${repo.full_name}`}>
            <img src={repo.owner.avatar_url} alt={repo.owner.login} />
            <div>
              <strong>{repo.full_name}</strong>
              <p>{repo.description}</p>
            </div>
            <FiChevronRight size={20}></FiChevronRight>
          </Link>
        ))}
      </Repositories>
    </>
  );
};

export default Dashboard;

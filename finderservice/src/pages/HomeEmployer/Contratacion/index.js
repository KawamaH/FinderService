import Layout from "@components/Layout";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useWorker } from "@context/HomeEmployerContext";
import { useUser } from "@context/UserContext";
import { useRouter } from "next/router";
import { loader } from "@public/assets";
import { useWorkers } from "@context/WorkersContext";
import axios from "axios";

const Contratacion = () =>{
    const {postInfoToPostulation, dataPostulation, setDataPostulation, getJobIDEmployer} = useWorker(); //Employers
    const {setSaveIds} = useWorkers();  //Workers
    const {userData} = useUser();
    const router = useRouter();

    const[sure,setSure] = useState(false);
    const [wait, setWait] = useState(false);

    const [postulationData, setPostulationData] = useState(dataPostulation);
    const [formData, setFormData] = useState({
        jobrequestId: "",
        jobpostulationId: "",
        workerId: "",
        employerId: userData._id,
    })

    const handlePayClick = async () => {
      try {
        setWait(true);
        await getJobIDEmployer(postulationData.jobrequest[0],postulationData._id)    //send IdRequest & IdPostulation 
        setWait(false);
        alert('Contratación realizada con éxito');
        setDataPostulation({}); 
        const response = await axios.post("/api/payment", {
          items: [
            {
              title: 'Worker',
              quantity:1,
              currency_id:'ARS',
              unit_price:1000
            }
          ],
          back_urls:{
            success:'http://localhost:3000/ReviewsEmployer',
            failure:'http://localhost:3000/ReviewsEmployer',
            pending:'http://localhost:3000/ReviewsEmployer',
          },
          auto_return:'approved',
          binary_mode:false,
        });
        const { init_point } = response.data;
        // Redirige al usuario a la URL de pago proporcionada por `init_point`
        window.location.href = init_point;
      } catch (error) {
        console.error("Error al crear la preferencia de pago:", error);
      }
    };

    useEffect(()=>{
        setPostulationData(dataPostulation);
        if(postulationData._id){
            setFormData({
                jobrequestId: postulationData.jobrequest[0],
                jobpostulationId: postulationData._id,
                workerId: postulationData.worker[0]._id,
                employerId: userData._id,
            })
        }
    //eslint-disable-next-line
    },[])

    const handleContratac = async () =>{
      setWait(true);
      await postInfoToPostulation(formData); 
      setWait(false);
    }
  return (
    <Layout>
      {postulationData === false ? (
        <>
          <div className="flex justify-center items-center w-full h-screen">
            <div className="flex flex-col items-center">
              <p className="mb-10 font-bold text-xl">
                ¡Necesitas seleccionar un empleado para poder contratarlo!
              </p>
              <Link href="/">
                <button className="font-bold bg-yellow-500 p-3 rounded-2xl">
                  Volver al Home
                </button>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-full h-screen flex justify-center items-center">
            <div className="flex flex-col">
              <div className="font-bold flex justify-center items-center mt-10">
                Detalle del profesional seleccionado
              </div>
              <div class="flex justify-center items-center mt-10 ">
                <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                  {postulationData.salary && userData._id ? (
                    <>
                      <h2 onClick={()=> console.log(formData)} className="font-bold text-xl">
                        {postulationData.worker[0].name}
                      </h2>
                      <br></br>
                      <div className="flex justify-center">
                        <Image
                          width={200}
                          height={200}
                          src={postulationData.worker[0].profilepic}
                          className="w-36 h-fit"
                          alt="xd3"
                        />
                      </div>
                      <br></br>
                      <h3>E-mail: {postulationData.worker[0].email}</h3>
                      <br></br>
                      <h3>Precio estimado: ${postulationData.salary}</h3>
                      <br></br>
                      <h3>Mensaje: {postulationData.message}</h3>
                      <br></br>
                      <div class="flex justify-center items-center space-x-8 mt-5 flex-row">
                        {(postulationData.state === "accepted")?<>
                            <button onClick={handlePayClick}                           
                              class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                            >
                              Terminar & Calificar
                            </button>
                        </>:<>
                          <button
                            onClick={() => setSure(true)}
                            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                          >
                            CONTRATAR
                          </button>
                        </>
                        }
                        <button class="bg-amber-400 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded">
                          <Link href="/HomeWorker/HEOffers">Volver</Link>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Cargando...</p>
                    </>
                  )}
                  {sure && (
                    <>
                      <div
                        dialogClassName="avatar-modal"
                        className="w-full h-screen absolute top-0 left-0 bg-black/50 z-40 flex flex-col items-center justify-center"
                      >
                        <div className="bg-white w-[40rem] pl-10 pr-10 pt-5 rounded-md flex flex-col overflow-hidden shadow-2xl">
                          <p>
                            ¿Estás seguro de contratar a{" "}
                            {postulationData.worker[0].name}?
                          </p>
                          <div className="p-4 flex flex-row gap-3 items-center justify-end">
                            <button
                              value="no"
                              className="btn-navbar"
                              onClick={() => setSure(false)}
                            >
                              No
                            </button>
                            <button
                              value="si"
                              className="btn-navbar"
                              onClick={handleContratac}
                              variant="primary"
                            >
                              Sí
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {wait && (
                    <>
                      <div
                        dialogClassName="avatar-modal"
                        className="w-full h-screen absolute top-0 left-0 bg-black/50 z-40 flex flex-col items-center justify-center"
                      >
                        <div className="bg-white w-[40rem] pl-10 pr-10 pt-5 rounded-md flex flex-col items-center overflow-hidden shadow-2xl">
                          <Image
                            src={loader}
                            width={300}
                            height={150}
                            alt="loading"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Contratacion;

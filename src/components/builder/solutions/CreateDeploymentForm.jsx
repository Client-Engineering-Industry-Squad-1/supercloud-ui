import React, { useState, useEffect }  from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Form, TextInput, Modal, ModalBody } from 'carbon-components-react';
import { Add16 } from '@carbon/icons-react';
import './_CreateDeploymentForm.scss';

const DeploymentForm = ({solutionId}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState([]);
  const [deploymentName, setDeploymentName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/solutions/${solutionId}/variables`);
        const jsonData = await response.json();
        setFormData(jsonData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [solutionId]);

  const renderFormInputs = () => {
    return formData.map((data, index) => {
      return (
        <TextInput
          key={index}
          id={data.name}
          labelText={data.name}
          defaultValue={data.value}
          helperText={data.description}
          onChange={(event) => {
            const newFormData = [...formData];
            newFormData[index].value = event.target.value;
            setFormData(newFormData);
          }}
        />
      );
    });
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleDeploymentNameChange = (event) => {
    setDeploymentName(event.target.value);
  };

  const handleSaveDraft = async () => {
    const data = {
      name: deploymentName,
      solution_id: solutionId,
      state: "Draft",
      variables: formData.map((item) => ({ name: item.name, value: item.value ? String(item.value) : "" }))
    };
    try {
      const response = await fetch(`/api/deployment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      console.log(data);
      const newDeployment = await response.json();
      const navBarItem = document.querySelector('a[href="/deployments"]');
      navBarItem.click();
      navigate(`/deployments/${newDeployment.id}`);
    } catch (error) {
      console.error(error);
    }
    handleCloseModal();
  };

  return (
    <>
      <Button className="deploy-button" renderIcon={Add16} onClick={handleOpenModal}>Deploy</Button>
      <Modal
        open={isOpen}
        onRequestClose={handleCloseModal}
        modalHeading="Deployment Form"
        primaryButtonText="Save Draft"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSaveDraft}
        onSecondarySubmit={handleCloseModal}
      >
        <ModalBody>
          <Form>
            <TextInput 
              id="deployment-name" 
              labelText="deployment_name" 
              required="true"
              onChange={handleDeploymentNameChange}
              value={deploymentName}
            />
            {renderFormInputs()}
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
}

export default DeploymentForm;


import { ServiceDataApi } from './service.api';
import { ServiceDataModel } from "../../models/services/serviceDataModel";
import * as superagent from "superagent";

export class ServiceData implements ServiceDataApi {

    baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl || '/services';
    }

    async getServices(): Promise<ServiceDataModel[]> {
        return superagent
            .get(this.baseUrl)
            .set('accept', 'application/json')
            .then(res => {
                return res.body || [];
            });

    }

    async getServiceDetails(serviceId: string): Promise<ServiceDataModel> {
        return superagent
            .get(this.baseUrl + "/" + serviceId + "?filter=%7B%22include%22%3A%20%5B%22controls%22%5D%7D")
            .set('accept', 'application/json')
            .then(res => {
                return res.body;
            });
    }
    async doDeleteService(serviceId: string): Promise<ServiceDataModel> {
        return superagent
            .delete(this.baseUrl + "/" + serviceId)
            .set('accept', 'application/json')
            .then(res => {
                return res.body;
            });
    }
    async doAddService(service_details: any): Promise<ServiceDataModel> {

        service_details.date = service_details.date + "T00:00:00.000Z";
        return superagent
            .post(this.baseUrl)
            .send(service_details)
            .set('accept', 'application/json')
            .then(res => {
                console.log(res.status);
                return res.body;
            });
    }
    async doUpdateService(service_details: any, serviceId: string): Promise<ServiceDataModel> {
        service_details.date = service_details.date + "T00:00:00.000Z";
        return superagent
            .patch(this.baseUrl + "/" + serviceId)
            .send(service_details)
            .set('accept', 'application/json')
            .then(res => {
                console.log(res.status);
                return res.body;
            });
    }
}



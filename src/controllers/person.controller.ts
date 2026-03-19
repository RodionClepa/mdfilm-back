import { Request, Response } from 'express';
import { personService } from '../services/person.service.js';

class PersonController {
  async getPeople(req: Request, res: Response) {
    try {
      const people = await personService.getAll();
      res.json(people);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message ?? 'Failed to fetch people' });
    }
  }

  async getPerson(req: Request, res: Response) {
    try {
      const person = await personService.getById(Number(req.params.id));
      res.json(person);
    } catch (error: any) {
      res.status(404).json({ error: error.message ?? 'Person not found' });
    }
  }

  async createPerson(req: Request, res: Response) {
    try {
      const person = await personService.create(req.body);
      res.status(201).json(person);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const personController = new PersonController();


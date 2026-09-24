import { colors } from '../styles/global';
import type { Materia } from '../types/studyflow';

export const materias: Materia[] = [
  { id: '1', nome: 'Desenvolvimento Mobile', professor: 'Kellen Nery', cor: colors.primary },
  { id: '2', nome: 'Banco de Dados', professor: 'A definir', cor: colors.success },
  { id: '3', nome: 'Engenharia de Software', professor: 'A definir', cor: colors.warning },
  { id: '4', nome: 'Programação Back-End', professor: 'A definir', cor: colors.danger }
];
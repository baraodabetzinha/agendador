/**
 * Teto de consultorias DIRETAS por especialista — quando o cliente escolhe
 * a pessoa no card. Agendamentos vindos do card "???" (sorteio) não contam.
 * Ao bater o teto, o especialista some das telas de seleção.
 *
 * Fica em arquivo próprio (sem prisma) para poder ser importado por
 * componentes client sem arrastar o Prisma para o bundle do navegador.
 */
export const MAX_DIRECT_BOOKINGS = 10

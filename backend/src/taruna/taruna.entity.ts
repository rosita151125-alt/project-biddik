import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Taruna {
  @PrimaryGeneratedColumn()
  id: number;

  // DATA PRIBADI
  @Column({ unique: true })
  nim: string;

  @Column()
  nama: string;

  @Column({ nullable: true })
  tempat_lahir: string;

  @Column({ type: 'date', nullable: true })
  tanggal_lahir: Date;

  @Column({ type: 'enum', enum: ['L', 'P'], nullable: true })
  jenis_kelamin: string;

  @Column({ nullable: true })
  agama: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  telepon: string;

  // DATA AKADEMIK (SIMPLE)
  @Column()
  program_studi: string;

  @Column()
  jurusan: string;

  @Column()
  tahun_masuk: number;

  @Column({ default: 1 })
  semester: number;

  @Column({ 
    type: 'enum', 
    enum: ['AKTIF', 'CUTI', 'DROP_OUT', 'LULUS'],
    default: 'AKTIF'
  })
  status: string;

  // DATA SISTEM
  @Column()
  upt_code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

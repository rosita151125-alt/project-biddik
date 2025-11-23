import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dosen')
export class Dosen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  nip: string; // NIP/NIDN

  @Column({ name: 'nidn', nullable: true })
  nidn: string; // Nomor Induk Dosen Nasional

  @Column()
  nama: string;

  @Column({ name: 'gelar_depan', nullable: true })
  gelarDepan: string;

  @Column({ name: 'gelar_belakang', nullable: true })
  gelarBelakang: string;

  @Column()
  jurusan: string;

  @Column({ name: 'program_studi' })
  programStudi: string;

  @Column()
  jabatan: string; // GURU BESAR, LEKTOR, dll

  @Column({ name: 'pendidikan_terakhir' })
  pendidikanTerakhir: string; // S1, S2, S3

  @Column()
  status: string; // AKTIF, CUTI, PENSION

  @Column({ name: 'upt_code' })
  uptCode: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  telepon: string;

  @Column({ type: 'date', nullable: true, name: 'tanggal_lahir' })
  tanggalLahir: Date;

  @Column({ nullable: true, name: 'tempat_lahir' })
  tempatLahir: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import { Column, Entity, EntityManager, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../product.entity/product";
import { User } from "../user.entity/user";
export type ProductType = "wuthering waves" | "solo leveling"
@Entity()
export class TypeProduct{
    @PrimaryGeneratedColumn("increment")
    Typeid!: string;
    @Column()
    TypeName!: string;
    @Column({default: true})
    Blocked!: boolean
    @Column()
    ImageLink!: string
    @OneToMany(()=>Product,(prod)=>prod.Type)
    Products!: Product[]
}
export class TypeProductController{
    static async GetAll(DataSourceManager: EntityManager){
        return DataSourceManager.getRepository(TypeProduct).findBy({Blocked: false})
    }
    static async AddNew(GUser: User,DataSourceManager: EntityManager,TypeProd: TypeProduct) : Promise<boolean>{
        if(GUser.UserRole == "admin"){
            await DataSourceManager.getRepository(TypeProduct).save(TypeProd)
            return true;
        }
        return false;
    }
}

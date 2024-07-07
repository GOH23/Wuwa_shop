import { Column, Entity, EntityManager, ManyToOne, PrimaryGeneratedColumn, Repository } from "typeorm";
import { TypeProduct } from "../type.entity/type.entity";
export type ProductType = "услуги" | "аккаунт" | "файл"
@Entity()
export class Product {
    @PrimaryGeneratedColumn("increment")
    ProductId!: string
    @Column()
    name!: string;
    @Column()
    description!: string;
    @Column({ default: "" })
    email!: string;
    @Column({ default: "" })
    password!: string;
    @Column({ default: "" })
    file!: string;
    @Column()
    price!: number;
    @Column()
    buyed!: boolean;
    @Column()
    imgurGallery!: string;
    @ManyToOne(() => TypeProduct, (type) => type.TypeName)
    Type!: TypeProduct
}
export class ProductController {
    static async GetAllByTypeID(DataSourceManager: EntityManager, id: string) {
        return DataSourceManager.getRepository(Product).findBy({ Type: { Typeid: id }, buyed: false })
    }
    static async GetAllByProductId(DataSourceManager: EntityManager, id: string) {
        return DataSourceManager.getRepository(Product).findOneBy({ ProductId: id })
    }
    static async SetProductBuyedAndGetData(DataSourceManager: EntityManager, PayloadId: string) {
        let repProduct: Repository<Product> = DataSourceManager.getRepository(Product)
        repProduct.update({ ProductId: PayloadId, file: "" }, { buyed: true });
        return repProduct.findOneBy({ ProductId: PayloadId })
    }
}
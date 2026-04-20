import { pool } from "../configs/db.js";

export const addProduct = async (req, res) => {
    try {
        const {
            category_id,
            seller_id,
            name,
            description,
            sku,
            price,
            mrp,
            stock_quantity,
            weight,
            length,
            breadth,
            height,
            brand,
            images, // Array of { url, variantTempId }
            slug,
            variants, // Array of { tempId, name, value, price, stock, weight }
            color,
            size,
            room
        } = req.body;

        if (!name || !price || !seller_id || !category_id) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing (name, price, seller_id, category_id)"
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const productResult = await client.query(
                `INSERT INTO products 
                (product_id, category_id, seller_id, name, description, sku, price, mrp, stock_quantity, weight, length, breadth, height, brand, images, slug, color, size, room) 
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
                RETURNING *`,
                [
                    category_id,
                    seller_id,
                    name,
                    description,
                    sku,
                    price,
                    mrp,
                    stock_quantity || 0,
                    weight || 0,
                    length || 0,
                    breadth || 0,
                    height || 0,
                    brand,
                    (images && images.length > 0) ? images.map(img => typeof img === 'string' ? img : img.url) : [],
                    slug || name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
                    color,
                    size,
                    room
                ]
            );

            const product = productResult.rows[0];

            // Insert into product_variants and keep map of tempId -> variant_id
            const variantMap = {};
            if (variants && variants.length > 0) {
                for (const variant of variants) {
                    const vRes = await client.query(
                        `INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, stock_quantity, weight) 
                        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7) 
                        RETURNING variant_id`,
                        [product.product_id, variant.sku || product.sku, variant.name, variant.value, (variant.price || variant.price === 0) ? variant.price : product.price, (variant.stock || variant.stock === 0) ? variant.stock : product.stock_quantity, (variant.weight || variant.weight === 0) ? variant.weight : product.weight]
                    );
                    if (variant.tempId) {
                        variantMap[variant.tempId] = vRes.rows[0].variant_id;
                    }
                }
            }

            // Insert into product_images
            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    const imageUrl = typeof img === 'string' ? img : img.url;
                    const variantId = (typeof img === 'object' && img.variantTempId) ? variantMap[img.variantTempId] : null;

                    await client.query(
                        `INSERT INTO product_images (image_id, product_id, image_url, is_primary, sort_order, variant_id) 
                        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
                        [product.product_id, imageUrl, i === 0, i, variantId]
                    );
                }
            }

            await client.query('COMMIT');

            return res.status(201).json({
                success: true,
                message: 'Product added successfully',
                data: product
            });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("ADD PRODUCT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: 'Adding product failed',
            error: error.message
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, 
            (SELECT json_agg(pi.* ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.product_id) as pi_images,
            (SELECT json_agg(pv.*) FROM product_variants pv WHERE pv.product_id = p.product_id) as variants
            FROM products p 
            WHERE p.is_active = true 
            ORDER BY p.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            message: 'Getting all products successful',
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting all products',
            error: error.message
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categories WHERE is_active = true ORDER BY name ASC");
        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting categories',
            error: error.message
        });
    }
};

export const getProductsById = async (req, res) => {
    try {
        const { product_id } = req.params;
        const result = await pool.query(`
            SELECT p.*, 
            (SELECT json_agg(pi.* ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.product_id) as pi_images,
            (SELECT json_agg(pv.*) FROM product_variants pv WHERE pv.product_id = p.product_id) as variants
            FROM products p 
            WHERE p.product_id = $1
        `, [product_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Getting product by id successful',
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting a product by id',
            error: error.message
        });
    }
};

export const addVariants = async (req, res) => {
    try {
        const { product_id, variants } = req.body;

        if (!product_id || !variants || !Array.isArray(variants)) {
            return res.status(400).json({
                success: false,
                message: "Product ID and variants array are required"
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const results = [];
            for (const variant of variants) {
                const res = await client.query(
                    `INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, stock_quantity, weight) 
                    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7) 
                    RETURNING *`,
                    [product_id, variant.sku, variant.name, variant.value, variant.price, variant.stock || 0, variant.weight]
                );
                results.push(res.rows[0]);
            }

            await client.query('COMMIT');

            return res.status(201).json({
                success: true,
                message: 'Variants added successfully',
                data: results
            });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Adding variants failed',
            error: error.message
        });
    }
};

export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await pool.query(`
            SELECT p.*, 
            (SELECT json_agg(pi.* ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.product_id) as pi_images,
            (SELECT json_agg(pv.*) FROM product_variants pv WHERE pv.product_id = p.product_id) as variants
            FROM products p 
            WHERE p.slug = $1
        `, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Getting product by slug successful',
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting a product by slug',
            error: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    const { product_id } = req.params;
    const { name, description, price, mrp, stock_quantity, brand, category_id, room } = req.body;

    try {
        const result = await pool.query(
            `UPDATE products 
             SET name = $1, description = $2, price = $3, mrp = $4, stock_quantity = $5, brand = $6, category_id = $7, room = $8
             WHERE product_id = $9 RETURNING *`,
            [name, description, price, mrp, stock_quantity, brand, category_id, room, product_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.log('Error updating product: ', error.message);
        return res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    const { product_id } = req.params;

    try {
        const result = await pool.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [product_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
    }
}
import { useState, useEffect, useCallback } from "react"
import { ProductContext } from "./ProductContext";
import * as productService from "../../services/productService";

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const mapProduct = (p) => {
        const mrp = Number(p.mrp) || 0;
        const price = Number(p.price) || 0;
        
        // Sort all images from table
        const dbImages = p.pi_images ? p.pi_images.sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)) : [];
        const mainImages = dbImages.filter(img => !img.variant_id).map(img => img.image_url);
        
        // Fallback to images array if no main images in table
        if (mainImages.length === 0 && Array.isArray(p.images) && p.images.length > 0) {
            mainImages.push(...p.images);
        }
        if (mainImages.length === 0) mainImages.push("https://via.placeholder.com/400");

        const finalImages = mainImages;

        return {
            ...p,
            id: p.product_id,
            // Base prices
            basePrice: mrp > 0 ? mrp : price,
            baseDiscountPrice: price,
            // Legacy/Display prices
            price: mrp > 0 ? mrp : price,
            discountPrice: price,
            discountPercent: (mrp > 0 && mrp > price) 
                ? Math.round(((mrp - price) / mrp) * 100) 
                : 0,
            reviewsCount: p.reviews_count || 0,
            rating: p.rating || 0,
            thumbnail: finalImages[0],
            images: finalImages,
            mainImages: mainImages,
            rawImages: dbImages,
            // Variants
            variants: p.variants || [],
            variantGroups: p.variants ? p.variants.reduce((acc, v) => {
              (acc[v.variant_name] = acc[v.variant_name] || []).push(v);
              return acc;
            }, {}) : {},
            displayVariants: p.variants || [],
            colorVariants: p.variants ? p.variants.filter(v => v.variant_name.toLowerCase() === 'color') : [],
            stock: p.stock_quantity || 0,
            status: p.is_active ? "Active" : "Inactive",
            group: p.category_id,
            room: p.room || "your home",
            color: p.color
        };
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await productService.getProducts();
            if (res.success) {
                const allProducts = [];
                res.data.forEach(p => {
                    const base = mapProduct(p);
                    // Add base product
                    allProducts.push(base);
                    
                    // Add each variant as a separate product entry
                    if (p.variants && p.variants.length > 0) {
                        p.variants.forEach(v => {
                            // Find specific images for this variant
                            const variantImg = base.rawImages.find(img => img.variant_id === v.variant_id);
                            
                            allProducts.push({
                                ...base,
                                id: `${p.product_id}-${v.variant_id}`,
                                isVariant: true,
                                variantId: v.variant_id,
                                name: `${p.name} - ${v.variant_value}`,
                                price: Number(v.price) || base.price,
                                discountPrice: Number(v.price) || base.discountPrice,
                                stock: Number(v.stock_quantity) || 0,
                                thumbnail: variantImg ? variantImg.image_url : base.thumbnail,
                                slug: `${base.slug}?v=${v.variant_id}` // Include variant ID in slug
                            });
                        });
                    }
                });
                setProducts(allProducts);
            }
        } catch (err) {
            console.error("Fetch products failed:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const addProduct = async (productData) => {
        const res = await productService.addProduct(productData);
        if (res.success) {
            const mapped = mapProduct(res.data);
            setProducts(prev => [mapped, ...prev]);
        }
        return res;
    }

    const updateProduct = async (id, productData) => {
        const res = await productService.updateProduct(id, productData);
        if (res.success) {
            const mapped = mapProduct(res.data);
            setProducts(prev => prev.map(p => p.id === id ? mapped : p));
        }
        return res;
    }

    const deleteProduct = async (id) => {
        const res = await productService.deleteProduct(id);
        if (res.success) {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
        return res;
    }

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading, fetchProducts }}>
            {children}
        </ProductContext.Provider>
    )
}
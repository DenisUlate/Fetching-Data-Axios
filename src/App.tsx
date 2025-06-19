import React, { useState, useEffect } from "react";
import { Search, Clock, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

// The MealDB API - Gratuita y sin API key
const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

function App() {
	const [recipes, setRecipes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [favorites, setFavorites] = useState([]);
	const [selectedRecipe, setSelectedRecipe] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		console.log("Component mounted, fetching random recipes...");
		fetchRandomRecipes();
	}, []);

	const fetchRandomRecipes = async () => {
		console.log("fetchRandomRecipes called");
		setLoading(true);
		setError("");

		try {
			// Obtener múltiples recetas aleatorias
			const promises = Array(6)
				.fill(null)
				.map(() => axios.get(`${API_BASE_URL}/random.php`));

			const responses = await Promise.all(promises);

			console.log("Random responses received:", responses);

			const meals = responses.map((response) => response.data.meals[0]).filter(Boolean);
			setRecipes(meals);
			console.log("Random recipes set:", meals);
		} catch (error) {
			console.error("Error fetching random recipes:", error);
			setError("Error al cargar las recetas. Intenta de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	const searchRecipes = async () => {
		console.log("searchRecipes called with term:", searchTerm);

		if (!searchTerm.trim()) {
			console.log("Search term is empty, returning");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await axios.get(`${API_BASE_URL}/search.php`, {
				params: { s: searchTerm },
			});

			console.log("Search response received:", response);

			if (response.data && response.data.meals) {
				setRecipes(response.data.meals);
				console.log("Search recipes set:", response.data.meals);
			} else {
				setRecipes([]);
				setError("No se encontraron recetas con ese término.");
			}
		} catch (error) {
			console.error("Error searching recipes:", error);
			setError("Error en la búsqueda. Intenta de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	const getRecipeDetails = async (id) => {
		console.log("getRecipeDetails called with id:", id);
		setError("");

		try {
			const response = await axios.get(`${API_BASE_URL}/lookup.php`, {
				params: { i: id },
			});

			console.log("Details response:", response.data);
			if (response.data && response.data.meals) {
				setSelectedRecipe(response.data.meals[0]);
			}
		} catch (error) {
			console.error("Error fetching recipe details:", error);
			setError("Error al cargar los detalles de la receta.");
		}
	};

	const toggleFavorite = (recipe) => {
		console.log("toggleFavorite called for recipe:", recipe.strMeal);
		setFavorites((prev) => {
			const isFavorite = prev.find((fav) => fav.idMeal === recipe.idMeal);
			if (isFavorite) {
				return prev.filter((fav) => fav.idMeal !== recipe.idMeal);
			} else {
				return [...prev, recipe];
			}
		});
	};

	const isFavorite = (recipeId) => {
		return favorites.some((fav) => fav.idMeal === recipeId);
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			searchRecipes();
		}
	};

	// Funciones helper para formatear datos de TheMealDB
	const getIngredients = (meal) => {
		const ingredients = [];
		for (let i = 1; i <= 20; i++) {
			const ingredient = meal[`strIngredient${i}`];
			const measure = meal[`strMeasure${i}`];
			if (ingredient && ingredient.trim()) {
				ingredients.push(`${measure ? measure.trim() + " " : ""}${ingredient.trim()}`);
			}
		}
		return ingredients;
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-4">Recipe Finder</h1>
					<p className="text-gray-600">Discover delicious recipes from around the world</p>
				</div>

				{/* Debug Info */}
				<div className="max-w-md mx-auto mb-4 p-2 bg-blue-100 rounded text-xs">
					<strong>Debug:</strong> Recipes: {recipes.length}, Loading: {loading.toString()}, Error: {error || "none"}
				</div>

				{/* Search Bar */}
				<div className="max-w-md mx-auto mb-8">
					<div className="flex gap-2">
						<Input
							type="text"
							placeholder="Search for recipes..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onKeyPress={handleKeyPress}
							className="flex-1"
						/>
						<Button onClick={searchRecipes} disabled={loading}>
							<Search className="w-4 h-4" />
						</Button>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-center gap-4 mb-8">
					<Button onClick={fetchRandomRecipes} variant="outline" disabled={loading}>
						{loading ? "Loading..." : "Random Recipes"}
					</Button>
					<Button variant="outline" disabled={favorites.length === 0}>
						Favorites ({favorites.length})
					</Button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="max-w-md mx-auto mb-6">
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
					</div>
				)}

				{/* Loading State */}
				{loading && (
					<div className="text-center py-8">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">Loading recipes...</p>
					</div>
				)}

				{/* No Results */}
				{!loading && recipes.length === 0 && !error && (
					<div className="text-center py-8">
						<p className="text-gray-600">No recipes found. Try clicking "Random Recipes".</p>
					</div>
				)}

				{/* Recipe Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{recipes.map((recipe) => (
						<Card key={recipe.idMeal} className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardHeader className="p-0">
								<div className="relative">
									<img
										src={recipe.strMealThumb}
										alt={recipe.strMeal}
										className="w-full h-48 object-cover rounded-t-lg"
									/>
									<Button
										size="sm"
										variant={isFavorite(recipe.idMeal) ? "default" : "outline"}
										className="absolute top-2 right-2"
										onClick={(e) => {
											e.stopPropagation();
											toggleFavorite(recipe);
										}}>
										<Heart className={`w-4 h-4 ${isFavorite(recipe.idMeal) ? "fill-current" : ""}`} />
									</Button>
								</div>
							</CardHeader>
							<CardContent className="p-4">
								<CardTitle className="text-lg mb-2 line-clamp-2">{recipe.strMeal}</CardTitle>
								<div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
									<div className="flex items-center gap-1">
										<Clock className="w-4 h-4" />
										30-45m
									</div>
									<div className="flex items-center gap-1">
										<Users className="w-4 h-4" />4 servings
									</div>
								</div>
								<div className="flex flex-wrap gap-1 mb-3">
									<Badge variant="secondary" className="text-xs">
										{recipe.strCategory}
									</Badge>
									<Badge variant="outline" className="text-xs">
										{recipe.strArea}
									</Badge>
								</div>
								<Button className="w-full" onClick={() => getRecipeDetails(recipe.idMeal)} variant="outline">
									View Recipe
								</Button>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Recipe Details Modal */}
				{selectedRecipe && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
							<CardHeader>
								<div className="flex justify-between items-start">
									<CardTitle className="text-2xl">{selectedRecipe.strMeal}</CardTitle>
									<Button variant="outline" size="sm" onClick={() => setSelectedRecipe(null)}>
										✕
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<img
									src={selectedRecipe.strMealThumb}
									alt={selectedRecipe.strMeal}
									className="w-full h-64 object-cover rounded-lg mb-4"
								/>
								<div className="grid grid-cols-3 gap-4 mb-4">
									<div className="text-center">
										<Badge variant="secondary">{selectedRecipe.strCategory}</Badge>
									</div>
									<div className="text-center">
										<Badge variant="outline">{selectedRecipe.strArea}</Badge>
									</div>
									<div className="text-center">
										{selectedRecipe.strTags && <Badge>{selectedRecipe.strTags.split(",")[0]}</Badge>}
									</div>
								</div>

								{/* Ingredients */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-2">Ingredients:</h3>
									<ul className="grid grid-cols-2 gap-1 text-sm">
										{getIngredients(selectedRecipe).map((ingredient, index) => (
											<li key={index} className="flex items-center">
												• {ingredient}
											</li>
										))}
									</ul>
								</div>

								{/* Instructions */}
								<div className="mb-4">
									<h3 className="text-lg font-semibold mb-2">Instructions:</h3>
									<p className="text-sm whitespace-pre-line">{selectedRecipe.strInstructions}</p>
								</div>

								{/* YouTube Link */}
								{selectedRecipe.strYoutube && (
									<div>
										<Button asChild>
											<a href={selectedRecipe.strYoutube} target="_blank" rel="noopener noreferrer">
												Watch Video Tutorial
											</a>
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
